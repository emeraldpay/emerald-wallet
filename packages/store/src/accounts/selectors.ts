import { Wei } from '@emeraldplatform/eth';
import {blockchainById, BlockchainCode, blockchainCodeToId} from '@emeraldwallet/core';
import {WalletsList, moduleName, IAddressesState} from './types';
import * as vault from '@emeraldpay/emerald-vault-core';
import {WalletsOp, WalletOp} from '@emeraldpay/emerald-vault-core';

let sum = (a: Wei | undefined, b: Wei | undefined) => (a || Wei.ZERO).plus(b || Wei.ZERO);

export function all (state: any): WalletsOp {
  return WalletsOp.of(allAsArray(state))
}

export function allAsArray (state: any): vault.Wallet[] {
  return (state[moduleName].wallets || [])
    .filter((value: any) => typeof value !== 'undefined');
}

export function allByBlockchain (state: any, blockchain: BlockchainCode): vault.WalletOp[] {
  return all(state)
    .walletsWithBlockchain(blockchainCodeToId(blockchain))
}

export const isLoading = (state: any): boolean => state[moduleName].loading;

export function findWalletByAddress(state: any, address: string, blockchain: BlockchainCode): WalletOp | undefined {
  if (!address) {
    return undefined;
  }

  return all(state).findWalletByAddress(address, blockchainCodeToId(blockchain));
}

export function find(state: any, id: vault.Uuid): vault.WalletOp | undefined {
  try {
    return all(state).getWallet(id)
  } catch (e) {
    return undefined;
  }
}

export function getBalance(state: IAddressesState, account: vault.EthereumAccount, defaultValue?: Wei): Wei | undefined {
  return (state.details || [])
    .filter((b) => b.accountId == account.id)
    .filter((b) => typeof b.balance === 'string' && b.balance !== '')
    .map((b) => new Wei(b.balance!))
    .reduce(sum, Wei.ZERO) || defaultValue
}

export function balanceByChain (state: any, blockchain: BlockchainCode): Wei {
  return all(state)
    .accountsByBlockchain(blockchainCodeToId(blockchain))
    .map((account) => getBalance(state, account, Wei.ZERO)!)
    .reduce(sum, Wei.ZERO)
}
