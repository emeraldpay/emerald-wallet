import {
  ActionTypes, IClean,
  IDisplayAccount,
  ILoadAddresses,
  ILoadBalances,
  ISetAddress,
  ISetBalance
} from "./types";
import {AnyCoinCode, BlockchainCode} from "@emeraldwallet/core";
import {SeedReference} from "@emeraldpay/emerald-vault-core";

export function loadAddresses(seed: SeedReference, hdpath: string, blockchains: BlockchainCode[]): ILoadAddresses {
  return {
    type: ActionTypes.LOAD_ADDRESSES,
    seed,
    hdpath,
    blockchains
  }
}

export function loadBalances(blockchain: BlockchainCode, address: string, assets: AnyCoinCode[]): ILoadBalances {
  return {
    type: ActionTypes.LOAD_BALANCES,
    blockchain,
    address,
    assets
  }
}

export function setAddresses(seed: SeedReference,
                             blockchain: BlockchainCode,
                             addresses: { [key: string]: string }): ISetAddress {
  return {
    type: ActionTypes.SET_ADDRESS,
    seed,
    blockchain,
    addresses
  };
}

export function setBalance(blockchain: BlockchainCode,
                           address: string,
                           asset: AnyCoinCode,
                           balance: string): ISetBalance {
  return {
    type: ActionTypes.SET_BALANCE,
    blockchain,
    address,
    asset,
    balance
  };
}

export function displayAccount(account: number): IDisplayAccount {
  return {
    type: ActionTypes.DISPLAY_ACCOUNT,
    account
  }
}

export function clean(): IClean {
  return {
    type: ActionTypes.CLEAN
  }
}