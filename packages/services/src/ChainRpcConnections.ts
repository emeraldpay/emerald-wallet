import { EthRpc } from '@emeraldplatform/eth-rpc';
import { BlockchainCode } from '@emeraldwallet/core';

export default class ChainRpcConnections {
  private connections: Map<any, any> = new Map();

  public add (chainCode: any, connection: any) {
    this.connections.set(chainCode.toLowerCase(), connection);
  }

  public chain (code: BlockchainCode): EthRpc {
    const codeStr = code.toLowerCase();
    if (!this.connections.has(codeStr)) {
      throw new Error(`Unsupported chain: ${codeStr}`);
    }
    return this.connections.get(codeStr);
  }
}
