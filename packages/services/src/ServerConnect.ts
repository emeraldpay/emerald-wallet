import * as os from 'os';
import { BlockchainClient } from '@emeraldpay/api-node';
import { BlockchainCode, ILogger, isEthereum } from '@emeraldwallet/core';
import ChainRpcConnections from './ChainRpcConnections';
import EthRpc from './ethrpc';
import { DefaultJsonRpc } from './jsonrpc';
import { EthersJsonRpc } from './jsonrpc/JsonRpc';
import GrpcTransport from './transports/GrpcTransport';

class ServerConnect {
  public appVersion: string;
  public blockchainClient: BlockchainClient;
  public headers: Record<string, string>;
  public locale: string;
  public log: ILogger;

  constructor(appVersion: string, locale: string, log: ILogger, blockchainClient: BlockchainClient) {
    this.appVersion = appVersion;
    this.blockchainClient = blockchainClient;
    this.headers = { 'User-Agent': `EmeraldWallet/${appVersion}` };
    this.locale = locale;
    this.log = log;
  }

  init(versions: NodeJS.ProcessVersions): void {
    const details = [os.platform(), os.release(), os.arch(), this.locale].join('; ');

    this.headers['User-Agent'] = [
      `Electron/${versions.electron} (${details})`,
      `EmeraldWallet/${this.appVersion} (+https://emerald.cash)`,
      `Chrome/${versions.chrome}`,
    ].join(' ');
  }

  connectEthChain(blockchain: BlockchainCode): EthRpc {
    const jsonRpc = new DefaultJsonRpc(new GrpcTransport(blockchain, this.blockchainClient), this.log);

    return new EthRpc(jsonRpc, new EthersJsonRpc(jsonRpc));
  }

  connectTo(blockchains: string[]): ChainRpcConnections {
    const connections = new ChainRpcConnections();

    blockchains.forEach((blockchain) => {
      const code = blockchain.toLowerCase() as BlockchainCode;

      if (isEthereum(code)) {
        connections.add(code, this.connectEthChain(code));

        this.log.info(`Creating connection to ${code}`);
      }
    });

    return connections;
  }

  getUserAgent(): string {
    return this.headers['User-Agent'];
  }
}

export default ServerConnect;
