import { ConnectionStatus } from '@emeraldpay/api';
import {
  AuthenticationStatus,
  BlockchainClient,
  CredentialsContext,
  MarketClient,
  MonitoringClient,
  TransactionClient,
  emeraldCredentials,
} from '@emeraldpay/api-node';
import { Logger, Versions } from '@emeraldwallet/core';
import { ChainListener } from '../ChainListener';
import { AddressListener } from '../services/balances/AddressListener';
import { PriceListener } from '../services/prices/PricesListener';

enum Status {
  CONNECTED = 'CONNECTED',
  CONNECTION_ISSUES = 'CONNECTION_ISSUES',
  DISCONNECTED = 'DISCONNECTED',
}

type StatusListener = (state: Status) => void;

interface ConnectionState {
  connectedAt: Date;
  authenticated: boolean;
  blockchainConnected: boolean;
  diagConnected: boolean;
  pricesConnected: boolean;
  transactionConnected: boolean;
}

const PERIOD_OK = 20000;
const PERIOD_ISSUES = PERIOD_OK * 3;
const PERIOD_PING = PERIOD_OK - 1500;

const log = Logger.forCategory('ApiAccess');

export class EmeraldApiAccess {
  public readonly address: string;
  public readonly blockchainClient: BlockchainClient;
  public readonly pricesClient: MarketClient;
  public readonly transactionClient: TransactionClient;

  private readonly credentials: CredentialsContext;
  private readonly connectionState: ConnectionState;

  private currentState?: Status = undefined;
  private listeners: StatusListener[] = [];
  private monitoringClient: MonitoringClient;

  constructor(address: string, id: string, versions: Versions) {
    this.address = address;

    const platform = [
      versions.osVersion.platform,
      versions.osVersion.release,
      versions.osVersion.arch,
      versions.appLocale,
    ].join('; ');

    const agent = [
      `EmeraldWallet/${versions.appVersion} (+https://emerald.cash)`,
      `Electron/${versions.electronVersion} (${platform})`,
      `Chrome/${versions.chromeVersion}`,
    ];

    this.connectionState = {
      connectedAt: new Date(),
      authenticated: false,
      blockchainConnected: false,
      diagConnected: false,
      pricesConnected: false,
      transactionConnected: false,
    };

    this.credentials = emeraldCredentials(address, agent, id);

    const channelCredentials = this.credentials.getChannelCredentials();

    this.blockchainClient = new BlockchainClient(address, channelCredentials, agent);
    this.monitoringClient = new MonitoringClient(address, channelCredentials, agent);
    this.pricesClient = new MarketClient(address, channelCredentials, agent);
    this.transactionClient = new TransactionClient(address, channelCredentials, agent);

    this.credentials.setListener((status: AuthenticationStatus) => {
      this.connectionState.authenticated = status === AuthenticationStatus.AUTHENTICATED;
      this.verifyConnection();
    });

    this.blockchainClient.setConnectionListener((status) => {
      this.connectionState.blockchainConnected = status === ConnectionStatus.CONNECTED;
      this.verifyConnection();
    });

    this.pricesClient.setConnectionListener((status) => {
      this.connectionState.pricesConnected = status === ConnectionStatus.CONNECTED;
      this.verifyConnection();
    });

    this.monitoringClient.setConnectionListener((status) => {
      this.connectionState.diagConnected = status === ConnectionStatus.CONNECTED;
      this.verifyConnection();
    });

    this.transactionClient.setConnectionListener((status) => {
      this.connectionState.transactionConnected = status === ConnectionStatus.CONNECTED;
      this.verifyConnection();
    });

    this.periodicCheck();
    this.ping();
  }

  public newAddressListener(): AddressListener {
    return new AddressListener(this.blockchainClient);
  }

  public newChainListener(): ChainListener {
    return new ChainListener(this.blockchainClient);
  }

  public newPricesListener(): PriceListener {
    return new PriceListener(this.pricesClient);
  }

  public statusListener(listener: StatusListener): void {
    this.listeners.push(listener);

    if (this.currentState != null) {
      listener(this.currentState);
    }
  }

  public notifyListener(status: Status): void {
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (e) {
        log.error('Failed to notify listener', e);
      }
    });
  }

  protected periodicCheck(): void {
    this.verifyOffline();

    setTimeout(this.periodicCheck.bind(this), 3000);
  }

  protected verifyConnection(): void {
    const status = this.connectionState;

    const connected =
      status.authenticated && status.blockchainConnected && status.pricesConnected && status.diagConnected;

    if (!connected) {
      this.verifyOffline();
    } else {
      this.connectionState.connectedAt = new Date();
      this.setStatus(Status.CONNECTED);
    }
  }

  protected verifyOffline(): void {
    const now = new Date();

    const offlinePeriod = now.getTime() - this.connectionState.connectedAt.getTime();

    if (offlinePeriod < PERIOD_OK) {
      this.setStatus(Status.CONNECTED);
    } else if (offlinePeriod < PERIOD_ISSUES) {
      this.setStatus(Status.CONNECTION_ISSUES);
    } else {
      this.setStatus(Status.DISCONNECTED);
    }
  }

  protected ping(): void {
    this.monitoringClient.ping().catch((error) => log.debug(`Ping error: ${error.message}`));

    setTimeout(this.ping.bind(this), PERIOD_PING);
  }

  protected setStatus(state: Status): void {
    if (this.currentState == null || this.currentState !== state) {
      if (state === Status.DISCONNECTED) {
        log.error('Disconnected', this.connectionState);
      } else if (state === Status.CONNECTION_ISSUES) {
        log.warn('Connection issues', this.connectionState);
      } else if (state === Status.CONNECTED) {
        log.info('Connected');
      }

      this.currentState = state;

      this.notifyListener(state);
    }
  }
}

export class EmeraldApiAccessDev extends EmeraldApiAccess {
  constructor(id: string, versions: Versions) {
    super('api2.emeraldpay.dev:443', id, versions);
  }
}

export class EmeraldApiAccessProd extends EmeraldApiAccess {
  constructor(id: string, versions: Versions) {
    super('api.emrld.io:443', id, versions);
  }
}
