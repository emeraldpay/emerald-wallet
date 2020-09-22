import { EthRpc } from '@emeraldplatform/eth-rpc';
import {BlockchainCode} from './blockchains';
import {IEmeraldVault} from '@emeraldpay/emerald-vault-core';

/**
 * Backend API - Emerald vault and Ethereum-like RPC
 */
export interface IApi {
  vault: IEmeraldVault;

  // @deprecated
  chain(name: BlockchainCode | string): EthRpc;
}
