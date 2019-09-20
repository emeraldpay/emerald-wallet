import { EthRpc } from '@emeraldplatform/eth-rpc';
import { Vault } from '@emeraldplatform/vault';
import { BlockchainCode } from './blockchains';

/**
 * Backend API - Emerald vault and Ethereum-like RPC
 */
export interface IApi {
  emerald: Vault;
  chain (name: BlockchainCode | string): EthRpc;
}
