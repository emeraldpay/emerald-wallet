import { EthRpc } from '@emeraldplatform/eth-rpc';
import { BlockchainCode } from './blockchains';
import { IVault } from './vault';

/**
 * Backend API - Emerald vault and Ethereum-like RPC
 */
export interface IApi {
  emerald: IVault;
  chain (name: BlockchainCode | string): EthRpc;
}
