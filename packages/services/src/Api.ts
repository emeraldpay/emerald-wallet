import {IServerConnect} from './ServerConnect';
import {Vault} from "@emeraldplatform/vault";
import {BlockchainCode} from '@emeraldwallet/core';
import {EthRpc} from "@emeraldplatform/eth-rpc";

export class Api {
  private emerald: Vault;
  private chains: any;

  constructor(connector: IServerConnect) {
    this.emerald = connector.connectEmerald();
    this.chains[BlockchainCode.ETC] = connector.connectEthChain(BlockchainCode.ETC);
    this.chains[BlockchainCode.ETH] = connector.connectEthChain(BlockchainCode.ETH);
  }

  public chain(code: BlockchainCode): EthRpc {
    return this.chains[code];
  }
}

export default Api;
