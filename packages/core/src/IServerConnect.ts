import { EthRpc } from '@emeraldplatform/eth-rpc';
import { BlockchainCode } from './blockchains/blockchains';

export interface IServerConnect {
  // TODO remove
  connectEthChain (name: BlockchainCode): null | EthRpc;
}
