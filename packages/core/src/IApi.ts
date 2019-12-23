import { EthRpc } from '@emeraldplatform/eth-rpc';
import { BlockchainCode } from './blockchains';
import { IVault } from './vault';
import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';

/**
 * Backend API - Emerald vault and Ethereum-like RPC
 */
export interface IApi {
  vault: IEmeraldVault;
  chain (name: BlockchainCode | string): EthRpc;
}
