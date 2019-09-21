import { EthRpc } from '@emeraldplatform/eth-rpc';
import { Vault } from '@emeraldplatform/vault';
import { BlockchainCode } from './blockchains/blockchains';

export interface IServerConnect {
  connectEmerald (): Vault;
  connectEthChain (name: BlockchainCode): null | EthRpc;
}
