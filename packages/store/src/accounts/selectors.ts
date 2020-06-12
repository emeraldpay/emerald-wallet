import * as vault from '@emeraldpay/emerald-vault-core';
import {Wei} from '@emeraldplatform/eth';
import {Account, BlockchainCode, Blockchains, Units, Wallet} from '@emeraldwallet/core';
import {registry} from '@emeraldwallet/erc20';
import BigNumber from 'bignumber.js';
import {createSelector} from 'reselect';
import {settings, tokens} from '../index';
import {IState} from '../types';
import {BalanceValueConverted, IBalanceValue, moduleName} from './types';
import * as accounts from "./index";
import {SeedDescription} from "@emeraldpay/emerald-vault-core";

const sum = (a: Wei | undefined, b: Wei | undefined) => (a || Wei.ZERO).plus(b || Wei.ZERO);

export const allWallets = (state: IState): Wallet[] => state[moduleName].wallets;

// export const all = createSelector<IState, Wallet[], WalletsOp>(
//   [allWallets],
//   (wallets) => {
//     return WalletsOp.of(wallets);
//   }
// );

/**
 * Returns all accounts from all wallets as flat array
 * @param state
 */
export const allAccounts = createSelector(
  [allWallets],
  (wallets) => {
    return wallets.reduce((a: Account[], w) => a.concat(w.accounts), []);
  }
);

export const findAccount = (state: IState, accountId: string) => {
  return allAccounts(state).find((a) => a.id === accountId);
};

export const allAccountsByBlockchain = (state: IState, code: BlockchainCode) => {
  const accounts: Account[] = allAccounts(state);
  return accounts.filter((a: Account) => a.blockchain === code);
};

export function allAsArray (state: IState): Wallet[] {
  return (state[moduleName].wallets || [])
    .filter((value: any) => typeof value !== 'undefined');
}

// @depricated
// export function allByBlockchain (state: any, blockchain: BlockchainCode): vault.WalletOp[] {
//   return all(state)
//     .walletsWithBlockchain(blockchainCodeToId(blockchain));
// }

export const isLoading = (state: any): boolean => state[moduleName].loading;

export function findWalletByAddress (state: any, address: string, blockchain: BlockchainCode): Wallet | undefined {
  if (!address) {
    return undefined;
  }

  return allWallets(state).find(
    (wallet: Wallet) =>
      wallet.accounts.some((a: Account) => a.address === address && a.blockchain === blockchain));
}

export function findAccountByAddress (state: any, address: string, chain: BlockchainCode): any {
  return null;
}

export function findWallet (state: IState, id: vault.Uuid): Wallet | undefined {
  return allWallets(state).find((w) => w.id === id);
}

export function getBalance (state: IState, accountId: string, defaultValue?: Wei): Wei | undefined {
  return (state[moduleName].details || [])
    .filter((b) => b.accountId === accountId)
    .filter((b) => typeof b.balance === 'string' && b.balance !== '')
    .map((b) => new Wei(b.balance!))
    .reduce(sum, Wei.ZERO) || defaultValue;
}

export function balanceByChain (state: IState, blockchain: BlockchainCode): Wei {
  return allAccountsByBlockchain(state, blockchain)
    .map((account: Account) => getBalance(state, account.id, Wei.ZERO)!)
    .reduce(sum, Wei.ZERO);
}

export function allBalances (state: IState): IBalanceValue[] {
  const assets: IBalanceValue[] = [];

  state[moduleName].wallets.forEach((wallet) =>
    getWalletBalances(state, wallet, false)
      .forEach((asset) => assets.push(asset))
  );

  return assets;
}

/**
 * Returns summary of all current assets for the specified wallet
 *
 * @param state
 * @param wallet
 * @param includeEmpty include zero balances
 */
export function getWalletBalances (state: IState, wallet: Wallet, includeEmpty: boolean): IBalanceValue[] {
  const assets: IBalanceValue[] = [];
  const ethereumAccounts = wallet.accounts;
  [BlockchainCode.ETH, BlockchainCode.ETC, BlockchainCode.Kovan]
    .forEach((code) => {
      const blockchainAccounts = ethereumAccounts
        .filter((account: Account) => account.blockchain === code);

      const balance = blockchainAccounts
        .map((account) => getBalance(state, account.id, Wei.ZERO)!)
        .reduce((a, b) => a.plus(b), Wei.ZERO);

      // show only assets that have at least one address in the wallet
      if (typeof balance !== 'undefined' && (includeEmpty || blockchainAccounts.length > 0)) {
        assets.push({
          token: Blockchains[code].params.coinTicker,
          balance
        });
      }
      const supportedTokens = registry.all()[code];
      if (typeof supportedTokens === 'undefined') {
        return;
      }

      supportedTokens.forEach((token) => {
        blockchainAccounts.forEach((account: Account) => {
          const balance = tokens.selectors.selectBalance(state, token.address, account.address!, code);
          if (balance && (includeEmpty || balance.unitsValue !== '0')) {
            assets.push({
              token: token.symbol,
              balance: new Units(balance.unitsValue, balance.decimals)
            });
          }
        });
      });
    });

  return aggregateByAsset(assets);
}

/**
 * Calculate total balance in currently selected fiat currency. Returns undefined if source is empty of if
 * some of the input assets doesn't have an exchange rate defined yet
 *
 * @param state
 * @param assets
 */
export function fiatTotalBalance (state: IState, assets: IBalanceValue[]): IBalanceValue | undefined {
  let allFound = true;
  const converted = assets
    .map((asset) => {
      const rate = settings.selectors.fiatRate(asset.token, state);
      if (typeof rate === 'undefined') {
        allFound = false;
        return new BigNumber(0);
      } else {
        let base;
        if (Units.isUnits(asset.balance)) {
          base = asset.balance
            .toBigNumber()
            .dividedBy(new BigNumber(10).pow(asset.balance.decimals));
        } else {
          base = (asset.balance as Wei).toWei()
            .dividedBy(new BigNumber(10).pow(18));
        }
        return base.multipliedBy(rate);
      }
    });

  if (converted.length === 0) {
    return undefined;
  }
  // if (!allFound) {
  //   return undefined;
  // }

  const total = converted.reduce((a: BigNumber, b: BigNumber) => a.plus(b));

  return {
    balance: new Units(total, 0),
    token: state.settings.localeCurrency
  };
}

/**
 * Aggregate multiple similar assets into one, by summing all values
 *
 * @param assets
 */
export function aggregateByAsset (assets: IBalanceValue[]): IBalanceValue[] {
  const group: {[key: string]: IBalanceValue[]} = {};
  assets.forEach((asset) => {
    let current = group[asset.token];
    if (typeof current === 'undefined') {
      current = [];
    }
    current.push(asset);
    group[asset.token] = current;
  });
  const result: IBalanceValue[] = [];
  Object.values(group)
    .map((g) => g.reduce((a: IBalanceValue, b: IBalanceValue) => {
      let balance;
      if (Units.isUnits(a.balance)) {
        if (!Units.isUnits(b.balance)) {
          throw new Error('Different data types. Units != other');
        }
        balance = new Units(a.balance.toBigNumber().plus(b.balance.toBigNumber()), a.balance.decimals);
      } else if (BigNumber.isBigNumber(a.balance)) {
        if (!BigNumber.isBigNumber(b.balance)) {
          throw new Error('Different data types. BigNumber != other');
        }
        balance = a.balance.plus(b.balance);
      } else {
        balance = (a.balance as Wei).plus(b.balance as Wei);
      }
      return {
        balance,
        token: a.token
      } as IBalanceValue;
    }))
    .forEach((g) => result.push(g));

  return result;
}

/**
 * Convert assets to fiat, plus return details about source asset
 * @param state
 * @param assets
 */
export function withFiatConversion (state: IState, assets: IBalanceValue[]): BalanceValueConverted[] {
  return assets
    .map((asset) => {
      return {
        source: asset,
        converted: fiatTotalBalance(state, [asset]),
        rate: settings.selectors.fiatRate(asset.token, state)
      } as BalanceValueConverted;
    })
    .filter((value) => typeof value.converted !== 'undefined' && typeof value.rate !== 'undefined');
}

export function getSeeds(state: IState): SeedDescription[] {
  return state[accounts.moduleName].seeds || []
}