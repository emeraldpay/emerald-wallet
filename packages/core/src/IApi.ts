import {IEmeraldVault} from '@emeraldpay/emerald-vault-core';

/**
 * Backend API - Emerald vault and Ethereum-like RPC
 */
export interface IApi {
  vault: IEmeraldVault;
}
