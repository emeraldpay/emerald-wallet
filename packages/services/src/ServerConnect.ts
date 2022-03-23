import {BlockchainClient} from '@emeraldpay/api-node';
import {BlockchainCode, ILogger, IServerConnect} from '@emeraldwallet/core';
import * as os from 'os';
import ChainRpcConnections from './ChainRpcConnections';
import GrpcTransport from './transports/GrpcTransport';
import EthRpc from "./ethrpc";
import {DefaultJsonRpc} from "./jsonrpc";

class ServerConnect implements IServerConnect {
  public headers: Record<string, string>;
  public appVersion: string;
  public locale: string;
  public log: ILogger;
  public blockchainClient: BlockchainClient;

  constructor(appVersion: string, locale: string, log: ILogger, blockchainClient: BlockchainClient) {
    this.appVersion = appVersion;
    this.blockchainClient = blockchainClient;
    this.headers = { 'User-Agent': `EmeraldWallet/${appVersion}` };
    this.locale = locale;
    this.log = log;
  }

  public init(versions: NodeJS.ProcessVersions): void {
    const details = [os.platform(), os.release(), os.arch(), this.locale].join('; ');

    this.headers['User-Agent'] = [
      `Electron/${versions.electron} (${details})`,
      `EmeraldWallet/${this.appVersion} (+https://emerald.cash)`,
      `Chrome/${versions.chrome}`,
    ].join(' ');
  }

  public connectEthChain(name: BlockchainCode): null | EthRpc {
    return new EthRpc(new DefaultJsonRpc(new GrpcTransport(name, this.blockchainClient)));
  }

  public connectTo(chains: string[]): ChainRpcConnections {
    const conns = new ChainRpcConnections();

    chains.forEach((chain) => {
      const chainCode = chain.toLowerCase();

      conns.add(chainCode, this.connectEthChain(chainCode as BlockchainCode));

      this.log.info(`Creating connection to ${chainCode}`);
    });

    return conns;
  }

  public getUserAgent(): string {
    return this.headers['User-Agent'];
  }
}

export default ServerConnect;
