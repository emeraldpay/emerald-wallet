import {BlockchainClient} from '@emeraldpay/api-node';
import {EthRpc} from '@emeraldplatform/eth-rpc';
import {DefaultJsonRpc} from '@emeraldplatform/rpc';
import {BlockchainCode, IServerConnect} from '@emeraldwallet/core';
import * as os from 'os';
import ChainRpcConnections from './ChainRpcConnections';
import GrpcTransport from './transports/GrpcTransport';


class ServerConnect implements IServerConnect {
  public headers: any;
  public appVersion: any;
  public locale: any;
  public log: any;
  public blockchainClient: BlockchainClient;

  constructor (
    appVersion: string, locale: any, log: any, blockchainClient: BlockchainClient) {
    this.log = log;
    this.appVersion = appVersion;
    this.locale = locale;
    this.blockchainClient = blockchainClient;
    this.headers = {
      'User-Agent': `EmeraldWallet/${appVersion}`
    };
  }

  public init (versions: any) {
    const details = [os.platform(), os.release(), os.arch(), this.locale].join('; ');
    this.headers['User-Agent'] = `Electron/${versions.electron} (${details}) EmeraldWallet/${this.appVersion} (+https://emerald.cash) Chrome/${versions.chrome} node-fetch/1.0`;
  }

  public connectTo (chains: any): ChainRpcConnections {
    const conns = new ChainRpcConnections();
    chains.forEach((c: any) => {
      const chainCode = c.toLowerCase();
      conns.add(chainCode, this.connectEthChain(chainCode));
      this.log.info(`Creating connection to ${chainCode}`);
    });
    return conns;
  }

  public connectEthChain(name: BlockchainCode): null | EthRpc {
    return new EthRpc(
      new DefaultJsonRpc(new GrpcTransport(name, this.blockchainClient))
    );
  }

  public disconnect (): Promise<any> {
    return Promise.resolve()
  }

  public getUserAgent () {
    return this.headers['User-Agent'];
  }
}

export default ServerConnect;
