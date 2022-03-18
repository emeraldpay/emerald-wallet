import { ConnectionStatus } from '@emeraldpay/api';
import {
  AuthenticationStatus,
  BlockchainClient,
  CredentialsContext,
  emeraldCredentials,
  MarketClient,
  MonitoringClient,
} from '@emeraldpay/api-node';
import { IEmeraldClient, Logger } from '@emeraldwallet/core';
import * as os from 'os';
import { ChainListener } from '../ChainListener';
import { AddressListener } from '../services/balances/AddressListener';
import { PriceListener } from '../services/prices/PricesListener';
import { TxListener } from '../services/transactions/TxListener';

enum Status {
  CONNECTED = 'CONNECTED',
  CONNECTION_ISSUES = 'CONNECTION_ISSUES',
  DISCONNECTED = 'DISCONNECTED',
}

type StatusListener = (state: Status) => void;

interface AppParams {
  electronVer: string;
  chromeVer: string;
  locale: string;
  version: string;
}

interface ConnectionState {
  authenticated: boolean;
  blockchainConnected: boolean;
  pricesConnected: boolean;
  diagConnected: boolean;
  connectedAt: Date;
}

const PERIOD_OK = 20000;
const PERIOD_ISSUES = PERIOD_OK * 3;
const PERIOD_PING = PERIOD_OK - 1500;

const log = Logger.forCategory('ApiAccess');

export class EmeraldApiAccess implements IEmeraldClient {
  public readonly blockchainClient: BlockchainClient;
  public readonly pricesClient: MarketClient;

  private readonly address: string;
  private readonly credentials: CredentialsContext;
  private readonly connectionState: ConnectionState;

  private currentState?: Status = undefined;
  private listeners: StatusListener[] = [];
  private monitoringClient: MonitoringClient;

  constructor(addr: string, id: string, appParams: AppParams) {
    this.address = addr;

    const platform = [os.platform(), os.release(), os.arch(), appParams.locale].join('; ');

    const agent = [
      `Electron/${appParams.electronVer} (${platform})`,
      `EmeraldWallet/${appParams.version} (+https://emerald.cash)`,
      `Chrome/${appParams.chromeVer}`,
    ];

    this.connectionState = {
      authenticated: false,
      blockchainConnected: false,
      pricesConnected: false,
      diagConnected: false,
      connectedAt: new Date(),
    };

    this.credentials = emeraldCredentials(addr, agent, id);
    this.blockchainClient = new BlockchainClient(addr, this.credentials.getChannelCredentials());
    this.monitoringClient = new MonitoringClient(addr, this.credentials.getChannelCredentials());
    this.pricesClient = new MarketClient(addr, this.credentials.getChannelCredentials());

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

    this.periodicCheck();
    this.ping();
  }

  public newAddressListener(): AddressListener {
    return new AddressListener(this.blockchainClient);
  }

  public newChainListener(): ChainListener {
    return new ChainListener(this.blockchainClient);
  }

  public newTxListener(): TxListener {
    return new TxListener(this.blockchainClient);
  }

  public newPricesListener(): PriceListener {
    return new PriceListener(this.pricesClient);
  }

  public statusListener(listener: StatusListener): void {
    this.listeners.push(listener);

    if (typeof this.currentState !== 'undefined') {
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
    this.monitoringClient.ping().catch((err) => console.warn('Ping error: ' + err.message));

    setTimeout(this.ping.bind(this), PERIOD_PING);
  }

  protected setStatus(state: Status): void {
    if (typeof this.currentState === 'undefined' || this.currentState !== state) {
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
  constructor(id: string, appParams: AppParams) {
    super('api2.emeraldpay.dev:443', id, appParams);
  }
}

export class EmeraldApiAccessLocal extends EmeraldApiAccess {
  constructor(id: string, appParams: AppParams) {
    super('127.0.0.1:8090', id, appParams);
  }
}

export class EmeraldApiAccessProd extends EmeraldApiAccess {
  constructor(id: string, appParams: AppParams) {
    super('api.emrld.io:443', id, appParams);
  }
}
