import {
  AuthenticationStatus,
  BlockchainClient,
  ConnectionStatus,
  CredentialsContext,
  emeraldCredentials,
  MarketClient,
  MonitoringClient
} from '@emeraldpay/grpc-client';
import { IEmeraldClient } from '@emeraldwallet/core';
import * as os from 'os';
import { ChainListener } from '../ChainListener';
import { AddressListener } from '../services/balances/AddressListener';
import { PriceListener } from '../services/prices/PricesListener';
import { TxListener } from '../services/transactions/TxListener';

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
  'MIIFgjCCA2qgAwIBAgIBATANBgkqhkiG9w0BAQsFADBhMRswGQYDVQQKExJFbWVy\n' +
  'YWxkUGF5IFN0YWdpbmcxHjAcBgNVBAsTFUVtZXJhbGRQYXkgU3RhZ2luZyBDQTEi\n' +
  'MCAGA1UEAxMZY2Euc3RhZ2luZy5lbWVyYWxkcGF5LmRldjAeFw0xOTA2MTQyMDQ4\n' +
  'NTBaFw0yMDEyMTQyMDQ4NTBaMGExGzAZBgNVBAoTEkVtZXJhbGRQYXkgU3RhZ2lu\n' +
  'ZzEeMBwGA1UECxMVRW1lcmFsZFBheSBTdGFnaW5nIENBMSIwIAYDVQQDExljYS5z\n' +
  'dGFnaW5nLmVtZXJhbGRwYXkuZGV2MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIIC\n' +
  'CgKCAgEA0o1BoOsYa8IvrgI0KEOh8p8Erq1qLolcaikvKYW3QBTJIuHrR5Jvo3Ia\n' +
  '1cBtGlsH6lWHPHdN9udbI67J8Wlx2Af0oDlf4YA1/iBAAwzaWocMfI8TpBpYLZrs\n' +
  'uHv+UtnA0MjtbSiG3206yhVxLRJfN/857JbjAkv912JAT3yXjylXTVOFTbks7PD6\n' +
  's1B2bOwiXbv/RY8HnOwNKgeYRzJVcZMisOJ+nSmGa5u2ah1TLCV20ivrTIyludqa\n' +
  'ssyXDFXmrHvu5Ey6J5+A3jVmY6l/9MeZO6UvNG1voqkhdT3bvgI4KRetFCAjSa/T\n' +
  'Ovakw3oAuJlYPWR9eiMhBIdNMZn1Cdna9QspK/s+atLfEZksBDBg8DWC4TFzoyM0\n' +
  'TyMkVh6hWCyQ3t7nBbHinzXOd7nNPJ3Nz3u+FYrGcb36GXSOXzKVuGiGGLvrR8Jo\n' +
  '58nFEfAsiiVMlTWPIBLInX05eFhP0vyQ375zh6+lwBJ6OqhCTS66IyjH3vTvJmC0\n' +
  'vX2o0aUgSpf2WhvIKhk6svcZFemPYnd+ZqPGgjDwymWb6gA/gHQF8AX5IXTk1YCT\n' +
  'O5LCgbt9FzYaAxwbYQB3dVPNkJfCdDXfg8UVyVkl8yPgZbxQLazpiNvUr32qVlyS\n' +
  'xM9PlaCF/GscTOk75ayrJrriv26BufR5vpDVZmRI3TcnSkieltMCAwEAAaNFMEMw\n' +
  'DgYDVR0PAQH/BAQDAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQAwHQYDVR0OBBYEFFK/\n' +
  'lakFlLnT68blTskBrZXPjMWxMA0GCSqGSIb3DQEBCwUAA4ICAQAzbPoRndIjGYJe\n' +
  'EWTRdiNeuJ8cpeRWmbRme67mnw7JsTGFvbrRPYmPpFKKw9hzDN7ILbXLuw3eaKLR\n' +
  'jRowxqXwBqRJE1WthF/x7W1ylxGFXCm3z5NzNYJjeHsy1LjLAiDcZTngP4PJRJb+\n' +
  'UN3dfE/jO27WvPu7skvKNX8irhiTviFeErmH/GSqmKqm5SoUv+qYGAEo6y3/B/H0\n' +
  'OgssftnMv2cyO9GO7c7GIlILnelK8diLDBWFBR6l/DDP2zbW25/tJCUYMjfEUfVl\n' +
  '/AA8vb4lJ+oO2pbj24dkahlYaCcvl4Y/xrEIygg9lZ/HM69Pj3M+dXQNDoZQ+BEy\n' +
  '6/of9rB7WFevore/9cVA98jGo5iZMZNDthiQptLL5zTX7QEQ909XRk0AVylaFkY7\n' +
  '9MU6XFYavFXU3AP6Cr027kw80WEW184YhL3yVfP9ae/Z3Kc3u3gNxX9Ac/dn7cej\n' +
  'UVHcs3Px5isgUDZOvl6LlA0VJaFi4zHZMP58jb3APVg/zEyKx6uohYWcanG7oC/h\n' +
  'rUSN3Y/9MEKPAEAxopRZH4srT1SLpPXeoZqZo5am2e4ttqK/uATj+LCiOB8iK9u8\n' +
  '1BqkK3YdAvljfAp8MxEispyJlznyFFbQ0xSIxBeQhh0MjhgFYhasZ5RGSg/K44VB\n' +
  'MwdfWdNfjQ7l+DFpz+mH6s/T/RjBWg==\n' +
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

const PERIOD_OK = 10000;
const PERIOD_ISSUES = PERIOD_OK * 3;
const PERIOD_PING = PERIOD_OK - 1500;

export interface IAppParams {
  electronVer: any;
  chromeVer: any;
  locale: any;
  version: any;
}

export class EmeraldApiAccess implements IEmeraldClient {

  public readonly blockchainClient: BlockchainClient;
  public readonly pricesClient: MarketClient;
  private readonly address: string;
  private readonly credentials: CredentialsContext;
  private monitoringClient: MonitoringClient;

  private listener?: StatusListener;
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

  public newPricesListener (): PriceListener {
    return new PriceListener(this.pricesClient);
  }

  public statusListener (listener: StatusListener) {
    this.listener = listener;
    if (typeof this.currentState !== 'undefined') {
      listener(this.currentState);
    }
  }

  protected periodicCheck () {
    this.verifyOffline({});
    setTimeout(this.periodicCheck.bind(this), 1000);
  }

  protected verifyConnection () {
    const status = this.connectionState;
    const connected = status.authenticated
      && status.blockchainConnected
      && status.pricesConnected
      && status.diagConnected;
    if (!connected) {
      this.verifyOffline({
        auth: status.authenticated,
        blockchain: status.blockchainConnected,
        market: status.pricesConnected,
        diag: status.diagConnected
      });
    } else {
      this.connectionState.connectedAt = new Date();
      this.setStatus(Status.CONNECTED);
    }
  }

  protected verifyOffline (basis: {[key: string]: boolean}) {
    const now = new Date();
    const offlinePeriod = now.getTime() - this.connectionState.connectedAt.getTime();
    if (offlinePeriod < PERIOD_OK) {
      this.setStatus(Status.CONNECTED);
    } else if (offlinePeriod < PERIOD_ISSUES) {
      this.setStatus(Status.CONNECTION_ISSUES, basis);
    } else {
      this.setStatus(Status.DISCONNECTED, basis);
    }
  }

  protected ping () {
    this.monitoringClient.ping();
    setTimeout(this.ping.bind(this), PERIOD_PING);
  }

  protected setStatus (state: Status, basis?: {[key: string]: boolean}) {
    if (typeof this.currentState === 'undefined' || this.currentState !== state) {
      if (state === Status.DISCONNECTED || state === Status.CONNECTION_ISSUES) {
        console.warn('Disconnected', basis);
      }
      this.currentState = state;
      if (this.listener) {
        this.listener(state);
      }
    }
  }
}

export class EmeraldApiAccessDev extends EmeraldApiAccess {
  constructor (id: string, appParams: any) {
    super('35.241.3.151:443', certDev, id, appParams);
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
