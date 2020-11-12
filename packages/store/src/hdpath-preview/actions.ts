import {
  ActionTypes,
  IClean,
  IDisplayAccount,
  IInit,
  ILoadAddresses,
  ILoadBalances,
  ISetAddress,
  ISetBalance,
} from "./types";
import {AnyCoinCode, BlockchainCode} from "@emeraldwallet/core";
import {LedgerApp, SeedReference} from "@emeraldpay/emerald-vault-core";
import {Dispatched} from "../types";
import {selectors} from "./index";
import {accounts} from "../index";
import {isBlockchainOpen} from "../hwkey/selectors";

export function loadAddresses(seed: SeedReference, account: number, blockchain: BlockchainCode): ILoadAddresses {
  return {
    type: ActionTypes.LOAD_ADDRESSES,
    seed,
    account,
    blockchain
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

export function displayAccount(account: number): Dispatched<IDisplayAccount> {
  return (dispatch, getState, extra) => {
    dispatch({
      type: ActionTypes.DISPLAY_ACCOUNT,
      account
    });
    const state = getState();
    const seed = state.hdpathPreview?.display?.seed;
    if (seed) {
      const isHardware = accounts.selectors.isHardwareSeed(state, seed)
      state.hdpathPreview?.display.blockchains.forEach((blockchain) => {
        if (!isHardware || isBlockchainOpen(state, blockchain)) {
          dispatch(loadAddresses(seed, account, blockchain))
        }
      })
    }
  }
}

export function clean(): IClean {
  return {
    type: ActionTypes.CLEAN
  }
}

export function init(blockchains: BlockchainCode[], seed: SeedReference): IInit {
  return {
    type: ActionTypes.INIT,
    blockchains,
    seed
  }
}