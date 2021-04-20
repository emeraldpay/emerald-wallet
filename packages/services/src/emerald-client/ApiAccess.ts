import {
  AuthenticationStatus,
  BlockchainClient,
  CredentialsContext,
  emeraldCredentials,
  MarketClient,
  MonitoringClient
} from '@emeraldpay/api-node';
import {ConnectionStatus} from '@emeraldpay/api';
import {IEmeraldClient, Logger} from '@emeraldwallet/core';
import * as os from 'os';
import {ChainListener} from '../ChainListener';
import {AddressListener} from '../services/balances/AddressListener';
import {PriceListener} from '../services/prices/PricesListener';
import {TxListener} from '../services/transactions/TxListener';

const certLocal = '-----BEGIN CERTIFICATE-----\n' +
  'MIIE4zCCAsugAwIBAgIQHgCBkxi2xOHMNb4vvXKSxTANBgkqhkiG9w0BAQsFADBs\n' +
  'MQswCQYDVQQGEwJDSDEMMAoGA1UEBxMDWnVnMRcwFQYDVQQKEw5FbWVyYWxkUGF5\n' +
  'IERldjEaMBgGA1UECxMRRW1lcmFsZFBheSBEZXYgQ0ExGjAYBgNVBAMTEWNhLmVt\n' +
  'ZXJhbGRwYXkuZGV2MB4XDTE5MDYwMjAyNDAzOFoXDTIwMTIwMjAyNDAzM1owaTEL\n' +
  'MAkGA1UEBhMCQ0gxDDAKBgNVBAcTA1p1ZzEXMBUGA1UEChMORW1lcmFsZFBheSBE\n' +
  'ZXYxHzAdBgNVBAsTFkVtZXJhbGRQYXkgR1JQQyBTZXJ2ZXIxEjAQBgNVBAMTCTEy\n' +
  'Ny4wLjAuMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALzVy2UFafC2\n' +
  'RpCnO95nrWSxT4gcids5RquyNdRY+O4HHzjaHAD4d/j9G1kZ0J0Ly+145xBuTxRK\n' +
  'FZ5GUo/Lp1FEW56CSHcB25hineTjaOPB/60SLy//1oN5/ow+wr+X6bjlMoELJIfl\n' +
  'votey8Bos0lal6M2mDxw9smP42KzpkuZCdHH222AxIOs6BQpFnMuhsTAXF/avpkp\n' +
  '+8clIof1e2CRaUQ4QQNQwcoi1VFTkWNwLh+wZRjNObFJt2Ng1rCIEycHluLcF3TQ\n' +
  'cOKXOmgklbjNqaFEg7ckyarg0/lauLtH9iVqx2MozZ8l1orHwXaoY7QZKo7exhEG\n' +
  'yOXtphT3RUkCAwEAAaOBgzCBgDAOBgNVHQ8BAf8EBAMCA7gwHQYDVR0lBBYwFAYI\n' +
  'KwYBBQUHAwEGCCsGAQUFBwMCMB0GA1UdDgQWBBRuR40Vyq/HnRY9Gj1tv/XHIpwY\n' +
  'ejAfBgNVHSMEGDAWgBSctyWodQE+97ZiTBJf/bEh8LwujzAPBgNVHREECDAGhwR/\n' +
  'AAABMA0GCSqGSIb3DQEBCwUAA4ICAQATzvKN+Nzv8mjw/qxcls8L0jNtjXXCTJyx\n' +
  '3t21APVNPZXSBbZsWOrzTDT6u2RDnaY2qR61DjCl2LElWPQRAtioh9zV2y+r/O1T\n' +
  'L7LGXqtB5S5e8SoEHU4cAHt9jzkUnCCR4HqxxuYUSreb76xF6NkdKbTIaaJxfmPJ\n' +
  'mO3SB2ayHVfbUkmDY3jh+0xgPRsizJq2Yi8HyJfgWe6nO3nDrrhPgBsHRGFHkZUY\n' +
  '1XSWzrTJcZ10kPFnN8Xq7fbT+qb2ACfcNluD7lv3g/jvpz+LpCn3oHNx+As6XZo0\n' +
  'bbamXAwE79qxt7OgkabXOPfAm00c5AOJBF6JlYXhzM/m834EHGZvBf/YoD2ocfj6\n' +
  '5MBq6UcxqormY8Go/wLff0nMpu7uzRnr1p3vbPcfjwPq3rHprh7gOw6mxfno3vXy\n' +
  'zcwxZcAetq1hPgLIF6jh+UbY+6+HwAiTjxOVlTZ6U6oLOmZlqIhN/EyOepl0Y5ZM\n' +
  'jYDvSBbFC2mK3dcKqbMWdxR5Ptw/o6/0wQPDtcPSqgAGJc47cBrATex5xsH01eDU\n' +
  '4OCYnpbGN3pHd0sWKfXVPPiTl70qejo9K9VssSt3eXVKBofr5VMcMK50/OhLF+En\n' +
  'ao3qUaQtlNFMIW5IuxRNYNijrS4d+xXqqsOSQ4yhXZFGHv5OrCZZJk17xJgBjPBS\n' +
  'jtj77R4smA==\n' +
  '-----END CERTIFICATE-----';

const certDev = '-----BEGIN CERTIFICATE-----\n' +
  'MIIESjCCAzKgAwIBAgINAeO0nXfN9AwGGRa24zANBgkqhkiG9w0BAQsFADBMMSAw\n' +
  'HgYDVQQLExdHbG9iYWxTaWduIFJvb3QgQ0EgLSBSMjETMBEGA1UEChMKR2xvYmFs\n' +
  'U2lnbjETMBEGA1UEAxMKR2xvYmFsU2lnbjAeFw0xNzA2MTUwMDAwNDJaFw0yMTEy\n' +
  'MTUwMDAwNDJaMEIxCzAJBgNVBAYTAlVTMR4wHAYDVQQKExVHb29nbGUgVHJ1c3Qg\n' +
  'U2VydmljZXMxEzARBgNVBAMTCkdUUyBDQSAxRDIwggEiMA0GCSqGSIb3DQEBAQUA\n' +
  'A4IBDwAwggEKAoIBAQCy2Xvh4dc/HJFy//kQzYcVeXS3PkeLsmFV/Qw2xn53Qjqy\n' +
  '+lJbC3GB1k3V6SskTSNeiytyXyFVtSnvRMvrglKrPiekkklBSt6o3THgPN9tek0t\n' +
  '1m0JsA7jYfKy/pBsWnsQZEm0CzwI8up5DGymGolqVjKgKaIwgo+BUQzzornZdbki\n' +
  'nicUukovLGNYh/FdEOZfkbu5W8xH4h51toyPzHVdVwXngsaEDnRyKss7VfVucOtm\n' +
  'acMkuziTNZtoYS+b1q6md3J8cUhYMxCv6YCCHbUHQBv2PeyirUedtJQpNLOML80l\n' +
  'A1g1wCWkVV/hswdWPcjQY7gg+4wdQyz4+anV7G+XAgMBAAGjggEzMIIBLzAOBgNV\n' +
  'HQ8BAf8EBAMCAYYwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMBIGA1Ud\n' +
  'EwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFLHdMl3otzdy0s5czib+R3niAQjpMB8G\n' +
  'A1UdIwQYMBaAFJviB1dnHB7AagbeWbSaLd/cGYYuMDUGCCsGAQUFBwEBBCkwJzAl\n' +
  'BggrBgEFBQcwAYYZaHR0cDovL29jc3AucGtpLmdvb2cvZ3NyMjAyBgNVHR8EKzAp\n' +
  'MCegJaAjhiFodHRwOi8vY3JsLnBraS5nb29nL2dzcjIvZ3NyMi5jcmwwPwYDVR0g\n' +
  'BDgwNjA0BgZngQwBAgEwKjAoBggrBgEFBQcCARYcaHR0cHM6Ly9wa2kuZ29vZy9y\n' +
  'ZXBvc2l0b3J5LzANBgkqhkiG9w0BAQsFAAOCAQEAcUrEwyOu9+OyAnmME+hTjoDF\n' +
  '8OPvcWCpqXs0ZYU0vUc7A1cWAJlIOuDg8OrNtkg81aty8NAby2QtOw10aNd0iDF8\n' +
  'aroO8IxNeM7aEPSKlkWXqZetxTUaGGTok7YNnR+5Xh2A6udbnI6uDqaE0tEXzrP7\n' +
  '9oFPPOZon8/xpnbFfafz3X1YD+D2YQEcUY52MytInVyBUXIIF7r9AdPuRvn0smhA\n' +
  'mTEBbE8bxlbrgXPSeVIFkiZbcc2dxNLOI3cPQXppXiElxvi3/3r3R97CAHucWkWc\n' +
  'Kk5GkNl1LNj/jO7M3GnrbOYV0KP/SAusVd/fJZ1CtlGjZpVgxdAi5yJ6UaXMhw==\n' +
  '-----END CERTIFICATE-----';

const certProd = '-----BEGIN CERTIFICATE-----\n' +
  'MIIEqTCCApGgAwIBAgIRAJz5sfnSdw0Q2pW1rWWKi6cwDQYJKoZIhvcNAQELBQAw\n' +
  'SDETMBEGA1UEChMKRW1lcmFsZFBheTEWMBQGA1UECxMNRW1lcmFsZFBheSBDQTEZ\n' +
  'MBcGA1UEAxMQY2EuZW1lcmFsZHBheS5pbzAeFw0xOTA3MTYxODI1MjdaFw0yMTAx\n' +
  'MTYxODE3MzVaMFIxEzARBgNVBAoTCkVtZXJhbGRQYXkxHzAdBgNVBAsTFkVtZXJh\n' +
  'bGRQYXkgR1JQQyBTZXJ2ZXIxGjAYBgNVBAMTEWFwaS5lbWVyYWxkcGF5LmlvMIIB\n' +
  'IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsnlDUvZUzoCERnJ2siyp0zfq\n' +
  'runRGjXdm1QD6eIP6VDFH74lcjcaDipUOQQYNZw90rWQPDCWAqO8Tbyz7fMn5qmO\n' +
  'R1LNF+GVBaX6oTk5rvBsE8DFvDUD5J9v0Em61fRDiqe5n7RQnSlQ1mQ1OefiCwph\n' +
  'lrnEs++rJ4CXUnlcWwg+vE5ttQAk7EiyImCEjXvdKIKRv+IpYF1Ahm9G6l6ebLKb\n' +
  'fkd1nLZFuKi50qsIaOCpHbooAmpsuml7K9wOheGnHZexYuWyQdmIlyv9HRsVY00i\n' +
  'ZEuUmgAGsGPIcVhixAMXLLiaJCuQQiEkwYh5y6vr62EU7CQfejyb7CnZffEmCwID\n' +
  'AQABo4GDMIGAMA4GA1UdDwEB/wQEAwIDuDAdBgNVHSUEFjAUBggrBgEFBQcDAQYI\n' +
  'KwYBBQUHAwIwHQYDVR0OBBYEFKWKVjHgcX9exAcBby6I3pXaKeWkMB8GA1UdIwQY\n' +
  'MBaAFEkfa4owd4YkBjPINFdUc4HgfhsfMA8GA1UdEQQIMAaHBCJicSQwDQYJKoZI\n' +
  'hvcNAQELBQADggIBACiMTujj42RlcUdqkv70kKK/PPebAoFI+899BgNK6AiaPS3a\n' +
  'pUQUwdu6PyFwzJPMUpl2DlUCVlHGQQw6hLPVxV4S/PxEmfoCdoDg/Z7E10PbY2qg\n' +
  'JO74ItrN0bYJJsFYacYwCiSfQYjz8dmYjlSL3Kh/rEN1gSeD4p1lXsGOOUajr0vP\n' +
  'qSqG3M4jfEq4Hfw5sGp1sttg+uuKtOFMwbuJ2lweiHHM0pF/qKxhRRUe30Hvq1Ch\n' +
  'y/dBrre4xaRvzxNsEL2L9GE39GaoImIoRIU7S5vV4I4hbcJ8A90VRSoX+4J+4wHd\n' +
  'RhQYgTJoCJtV+DcuffhSmt9c3pIf0okJPsBmEA+udZrIHpKH3Ur2cX0vMlMfrr6/\n' +
  'jWOcq2TS7DlQKjpDytZMZ+p8tGgKKyMcgaES7AD2r08j4uHqQz9dxEhI6/yf62cn\n' +
  'OhOktzzzEo9phL1wqqIHig6FKgHLfGSE26wBazzWI5R4VEnZdWsgaSZyNxPjeYe5\n' +
  'H61fIKjYoCBDSZRfqdXNceekIt9SlyoDrxJOvpecyqF1WOgFIdG3gdRLpxc8SwXZ\n' +
  'KRyLylr012MmjbidYw5n5NKEf7MFKX0CD/001d0Qa5O5anp5B+NE9Hwc9ockkPaW\n' +
  'DmQ/4UNGV1gJpX7NQISGfgI2SZWAlJrLEgD0f/ZN2+647nOFH8BOQRfLrwUv\n' +
  '-----END CERTIFICATE-----\n';

export enum Status {
  CONNECTED = 'CONNECTED',
  CONNECTION_ISSUES = 'CONNECTION_ISSUES',
  DISCONNECTED = 'DISCONNECTED'
}
export type StatusListener = (state: Status) => void;

interface IConnectionState {
  authenticated: boolean;
  blockchainConnected: boolean;
  pricesConnected: boolean;
  diagConnected: boolean;
  connectedAt: Date;
}

const PERIOD_OK = 20000;
const PERIOD_ISSUES = PERIOD_OK * 3;
const PERIOD_PING = PERIOD_OK - 1500;

export interface IAppParams {
  electronVer: any;
  chromeVer: any;
  locale: any;
  version: any;
}

const log = Logger.forCategory('ApiAccess');

export class EmeraldApiAccess implements IEmeraldClient {

  public readonly blockchainClient: BlockchainClient;
  public readonly pricesClient: MarketClient;
  private readonly address: string;
  private readonly credentials: CredentialsContext;
  private monitoringClient: MonitoringClient;

  private listeners: StatusListener[] = [];
  private currentState?: Status = undefined;
  private connectionState: IConnectionState;

  constructor (addr: string, cert: string, id: string, appParams: IAppParams) {
    this.address = addr;
    const platform = [os.platform(), os.release(), os.arch(), appParams.locale].join('; ');
    const agent = [
      `Electron/${appParams.electronVer} (${platform})`,
      `EmeraldWallet/${appParams.version} (+https://emerald.cash)`,
      `Chrome/${appParams.chromeVer}`
    ];
    this.connectionState = {
      authenticated: false,
      blockchainConnected: false,
      pricesConnected: false,
      diagConnected: false,
      connectedAt: new Date()
    };

    this.credentials = emeraldCredentials(addr, cert, agent, id);
    this.blockchainClient = new BlockchainClient(addr, this.credentials.getChannelCredentials());
    this.pricesClient = new MarketClient(addr, this.credentials.getChannelCredentials());
    this.monitoringClient = new MonitoringClient(addr, this.credentials.getChannelCredentials());

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

  public newAddressListener (): AddressListener {
    return new AddressListener(this.blockchainClient);
  }

  public newChainListener (): ChainListener {
    return new ChainListener(this.blockchainClient);
  }

  public newTxListener (): TxListener {
    return new TxListener(this.blockchainClient);
  }

  public newPricesListener(): PriceListener {
    return new PriceListener(this.pricesClient);
  }

  public statusListener(listener: StatusListener) {
    this.listeners.push(listener);
    if (typeof this.currentState !== 'undefined') {
      listener(this.currentState);
    }
  }

  public notifyListener(status: Status) {
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (e) {
        log.error("Failed to notify listener", e)
      }
    })
  }

  protected periodicCheck() {
    this.verifyOffline();
    setTimeout(this.periodicCheck.bind(this), 3000);
  }

  protected verifyConnection() {
    const status = this.connectionState;
    const connected = status.authenticated
      && status.blockchainConnected
      && status.pricesConnected
      && status.diagConnected;
    if (!connected) {
      this.verifyOffline();
    } else {
      this.connectionState.connectedAt = new Date();
      this.setStatus(Status.CONNECTED);
    }
  }

  protected verifyOffline() {
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

  protected ping () {
    this.monitoringClient.ping()
      .then(() => {
      })
      .catch((err) => console.warn("Ping error: " + err.message));
    setTimeout(this.ping.bind(this), PERIOD_PING);
  }

  protected setStatus(state: Status) {
    if (typeof this.currentState === 'undefined' || this.currentState !== state) {
      if (state === Status.DISCONNECTED) {
        log.error('Disconnected', this.connectionState);
      } else if (state === Status.CONNECTION_ISSUES) {
        log.warn('Connection issues', this.connectionState);
      } else if (state === Status.CONNECTED) {
        log.info("Connected")
      }
      this.currentState = state;
      this.notifyListener(state);
    }
  }
}

export class EmeraldApiAccessDev extends EmeraldApiAccess {
  constructor (id: string, appParams: any) {
    super('api2.emeraldpay.dev:443', certDev, id, appParams);
  }
}

export class EmeraldApiAccessLocal extends EmeraldApiAccess {
  constructor (id: string, appParams: any) {
    super('127.0.0.1:8090', certLocal, id, appParams);
  }
}

export class EmeraldApiAccessProd extends EmeraldApiAccess {
  constructor (id: string, appParams: any) {
    super('34.98.113.36:443', certProd, id, appParams);
  }
}
