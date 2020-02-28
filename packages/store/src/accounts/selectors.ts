import {Wei} from '@emeraldplatform/eth';
import {BlockchainCode, blockchainCodeToId, Blockchains, blockchains, Units} from '@emeraldwallet/core';
import {BalanceValue, BalanceValueConverted, moduleName} from './types';
import * as vault from '@emeraldpay/emerald-vault-core';
import {Wallet, WalletOp, WalletsOp} from '@emeraldpay/emerald-vault-core';
import {registry} from "@emeraldwallet/erc20";
import {State} from "../types";
import {tokens, settings} from "../index";
import BigNumber from "bignumber.js";

let sum = (a: Wei | undefined, b: Wei | undefined) => (a || Wei.ZERO).plus(b || Wei.ZERO);

export function all (state: any): WalletsOp {
  return WalletsOp.of(allAsArray(state))
}

export function allAsArray (state: State): vault.Wallet[] {
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

export function getBalance(state: State, account: vault.EthereumAccount, defaultValue?: Wei): Wei | undefined {
  return (state.addresses.details || [])
    .filter((b) => b.accountId == account.id)
    .filter((b) => typeof b.balance === 'string' && b.balance !== '')
    .map((b) => new Wei(b.balance!))
    .reduce(sum, Wei.ZERO) || defaultValue
}

export function balanceByChain (state: State, blockchain: BlockchainCode): Wei {
  return all(state)
    .accountsByBlockchain(blockchainCodeToId(blockchain))
    .map((account) => getBalance(state, account, Wei.ZERO)!)
    .reduce(sum, Wei.ZERO)
}

export function allBalances(state: State): BalanceValue[] {
  let assets: BalanceValue[] = [];

  state.addresses.wallets.forEach((wallet) =>
    getWalletBalances(state, wallet, false)
      .forEach((asset) => assets.push(asset))
  );

  return assets;
}

/**
 * Returns summary of all current assets for the specified wallet
 *
 * @param state
 * @param _wallet
 * @param includeEmpty include zero balances
 */
export function getWalletBalances(state: State, _wallet: Wallet | WalletOp, includeEmpty: boolean): BalanceValue[] {
  let wallet = WalletOp.asOp(_wallet);
  let assets: BalanceValue[] = [];
  let ethereumAccounts = wallet.getEthereumAccounts();
  [BlockchainCode.ETH, BlockchainCode.ETC, BlockchainCode.Kovan]
    .forEach((code) => {
      let blockchainAccounts = ethereumAccounts
        .filter((account) => account.blockchain == blockchainCodeToId(code));
      let balance = blockchainAccounts
        .map((account) => getBalance(state, account, Wei.ZERO)!)
        .reduce((a, b) => a.plus(b), Wei.ZERO);
      // show only assets that have at least one address in the wallet
      if (typeof balance !== 'undefined' && (includeEmpty || blockchainAccounts.length > 0)) {
        assets.push({
          token: Blockchains[code].params.coinTicker,
          balance: balance
        })
      }
      let supportedTokens = registry.all()[code];
      if (typeof supportedTokens !== 'undefined') {
        supportedTokens.forEach((token) => {
          blockchainAccounts.forEach((account) => {
            let balance = tokens.selectors.selectBalance(state, token.address, account.address, code);
            if (balance && (includeEmpty || balance.unitsValue !== '0')) {
              assets.push({
                token: token.symbol,
                balance: new Units(balance.unitsValue, balance.decimals),
              })
            }
          })
        })
      }
    });

  return aggregateByAsset(assets)
}

/**
 * Calculate total balance in currently selected fiat currency. Returns undefined if source is empty of if
 * some of the input assets doesn't have an exchange rate defined yet
 *
 * @param state
 * @param assets
 */
export function fiatTotalBalance(state: State, assets: BalanceValue[]): BalanceValue | undefined {
  let allFound = true;
  let converted = assets
    .map((asset) => {
      let rate = settings.selectors.fiatRate(asset.token, state);
      if (typeof rate === "undefined" ) {
        allFound = false;
        return new BigNumber(0);
      } else {
        let base;
        if (Units.isUnits(asset.balance)) {
          base = asset.balance
            .toBigNumber()
            .dividedBy(new BigNumber(10).pow(asset.balance.decimals))
        } else {
          base = (asset.balance as Wei).toWei()
            .dividedBy(new BigNumber(10).pow(18))
        }
        return base.multipliedBy(rate);
      }
    });

  if (converted.length == 0) {
    return undefined;
  }
  if (!allFound) {
    return undefined;
  }

  let total = converted.reduce((a, b) => a.plus(b));

  return {
    balance: new Units(total, 0),
    token: state.wallet.settings.localeCurrency
  }
}

/**
 * Aggregate multiple similar assets into one, by summing all values
 *
 * @param assets
 */
export function aggregateByAsset(assets: BalanceValue[]): BalanceValue[] {
  let group: {[key: string]: BalanceValue[]} = {};
  assets.forEach((asset) => {
    let current = group[asset.token];
    if (typeof current === 'undefined') {
      current = []
    }
    current.push(asset);
    group[asset.token] = current;
  });
  let result: BalanceValue[] = [];
  Object.values(group)
    .map((g) => g.reduce((a: BalanceValue, b: BalanceValue) => {
      let balance;
      if (Units.isUnits(a.balance)) {
        if (!Units.isUnits(b.balance)) {
          throw new Error("Different data types. Units != other")
        }
        balance = new Units(a.balance.toBigNumber().plus(b.balance.toBigNumber()), a.balance.decimals)
      } else if (BigNumber.isBigNumber(a.balance)) {
        if (!BigNumber.isBigNumber(b.balance)) {
          throw new Error("Different data types. BigNumber != other")
        }
        balance = a.balance.plus(b.balance)
      } else {
        balance = (a.balance as Wei).plus(b.balance as Wei)
      }
      return {
        balance,
        token: a.token
      } as BalanceValue
    }))
    .forEach((g) => result.push(g));

  return result
}

/**
 * Convert assets to fiat, plus return details about source asset
 * @param state
 * @param assets
 */
export function withFiatConversion(state: State, assets: BalanceValue[]): BalanceValueConverted[] {
  return assets
    .map((asset) => {
      return {
        source: asset,
        converted: fiatTotalBalance(state, [asset]),
        rate: settings.selectors.fiatRate(asset.token, state)
      } as BalanceValueConverted
    })
    .filter((value) => typeof value.converted !== 'undefined' && typeof value.rate !== 'undefined')
}