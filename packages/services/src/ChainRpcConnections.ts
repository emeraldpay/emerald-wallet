import { BlockchainCode } from '@emeraldwallet/core';
import EthRpc from './ethrpc';

export default class ChainRpcConnections {
  private connections: Map<string, EthRpc> = new Map();

  add(code: string, connection: EthRpc): void {
    this.connections.set(code.toLowerCase(), connection);
  }

  chain(blockchain: BlockchainCode): EthRpc {
    const code = blockchain.toLowerCase();
    const connection = this.connections.get(code);

    if (connection == null) {
      throw new Error(`Unsupported chain: ${code}`);
    }

    return connection;
  }
}
