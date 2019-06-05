import {Vault} from "@emeraldplatform/vault";
import {BlockchainCode} from './blockchains/blockchains';
import {EthRpc} from "@emeraldplatform/eth-rpc";

export interface IServerConnect {
  connectEmerald(): Vault;
  connectEthChain(name: BlockchainCode): null | EthRpc;
}
