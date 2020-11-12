import {BigAmount, CreateAmount} from '@emeraldpay/bigamount';
import {
  amountDecoder,
  amountFactory, BalanceUtxo,
  BlockchainCode,
  blockchainCodeToId,
  blockchainIdToCode,
  CurrencyAmount,
  isBitcoin,
  isEthereum
} from '@emeraldwallet/core';
import {registry} from '@emeraldwallet/erc20';
import {createSelector} from 'reselect';
import {settings, tokens} from '../index';
import {IState} from '../types';
import {BalanceValueConverted, IBalanceValue, moduleName} from './types';
import * as accounts from "./index";
import {
  EntryId,
  EntryIdOp,
  EthereumEntry, isBitcoinEntry,
  isEthereumEntry,
  SeedDescription,
  Uuid,
  Wallet,
  WalletEntry,
  WalletOp
} from "@emeraldpay/emerald-vault-core";
import {
  BitcoinEntry,
  isIdSeedReference,
  isLedger,
  isSeedReference,
  SeedReference
} from "@emeraldpay/emerald-vault-core/lib/types";

function sum<T extends BigAmount>(a: T | undefined, b: T | undefined): T {
  if (typeof a == 'undefined') {
    return b!;
  }
  if (typeof b == 'undefined') {
    return a;
  }
  return b.plus(a);
}

export function zeroAmountFor<T extends BigAmount>(blockchain: BlockchainCode): T {
  const amountCreate = amountFactory(blockchain) as CreateAmount<T>;
  return amountCreate(0)
}

export const allWallets = (state: IState): Wallet[] => state[moduleName].wallets;

/**
 * Returns all accounts from all wallets as flat array
 * @param state
 */
export const allEntries = createSelector(
  [allWallets],
  (wallets) => {
    return wallets.reduce((a: WalletEntry[], w) => a.concat(w.entries), []);
  }
);

export const allEntriesByBlockchain = (state: IState, code: BlockchainCode) => {
  const accounts: WalletEntry[] = allEntries(state);
  return accounts.filter((a: WalletEntry) => blockchainIdToCode(a.blockchain) === code);
};

export function findEntry(state: IState, id: EntryId): WalletEntry | undefined {
  let walletId = EntryIdOp.asOp(id).extractWalletId()
  let wallet = findWallet(state, walletId);
  if (wallet) {
    return wallet.entries.find((e) => e.id == id)
  }
  return undefined
}

export function allAsArray(state: IState): Wallet[] {
  return (state[moduleName].wallets || [])
    .filter((value: any) => typeof value !== 'undefined');
}

export const isLoading = (state: any): boolean => state[moduleName].loading;

export function findWalletByAddress(state: any, address: string, blockchain: BlockchainCode): Wallet | undefined {
  if (!address) {
    return undefined;
  }

  return allWallets(state).find(
    (wallet: Wallet) => WalletOp.of(wallet).findEntryByAddress(address, blockchainCodeToId(blockchain))
  );
}

export function findAccountByAddress(state: any, address: string, chain: BlockchainCode): WalletEntry | undefined {
  return allEntries(state).find((e) => {
    if (blockchainCodeToId(chain) != e.blockchain) {
      return false
    }
    if (isEthereumEntry(e)) {
      return e.address?.value == address
    } else if (isBitcoinEntry(e)) {
      //TODO would not find old address
      return e.addresses.some((a) => a.address == address)
    }
    return false
  });
}

export function findWallet(state: IState, id: Uuid): Wallet | undefined {
  return allWallets(state).find((w) => w.id === id);
}


export function getBalance<T extends BigAmount>(state: IState, entryId: string, defaultValue?: T): T | undefined {
  const entry = findEntry(state, entryId);
  if (!entry) {
    console.warn("Unknown entry", entryId);
    return defaultValue;
  }

  const amountDecode = amountDecoder<T>(blockchainIdToCode(entry.blockchain));
  const zero = zeroAmountFor<T>(blockchainIdToCode(entry.blockchain));

  const entryDetails = (state[moduleName].details || [])
    .filter((b) => b.entryId === entryId);

  if (entryDetails.length == 0) {
    return defaultValue || zero;
  }

  if (isEthereumEntry(entry)) {
    return entryDetails
      .filter((b) => typeof b.balance === 'string' && b.balance !== '')
      .map((b) => b.balance)
      .map((b) => b as string)
      .map(amountDecode)
      .reduce(sum) || defaultValue;
  } else if (isBitcoinEntry(entry)) {
    return entryDetails
      .filter((b) => typeof b.utxo != "undefined")
      .map((b) => b.utxo!)
      .reduce((a, b) => a.concat(...b))
      .map((u) => u.value)
      .map(amountDecode)
      .reduce(sum) || defaultValue
  } else {
    console.warn("Invalid entry", entry);
  }
}

export function balanceByChain<T extends BigAmount>(state: IState, blockchain: BlockchainCode): T {
  const zero = zeroAmountFor<T>(blockchain);
  return allEntriesByBlockchain(state, blockchain)
    .map((account: WalletEntry) => getBalance(state, account.id, zero)!)
    .reduce(sum, zero);
}

/**
 * Balances of all assets summarized by wallet
 * @param state
 */
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
  if (typeof wallet == "undefined") {
    return assets;
  }
  const ethereumAccounts = wallet.entries.filter((e) => isEthereumEntry(e)) as EthereumEntry[];
  [BlockchainCode.ETH, BlockchainCode.ETC, BlockchainCode.Kovan]
    .forEach((code) => {
      const zero = zeroAmountFor<BigAmount>(code);

      const blockchainAccounts = ethereumAccounts
        .filter((account: EthereumEntry) => account.blockchain === blockchainCodeToId(code));

      const balance = blockchainAccounts
        .map((account) => getBalance(state, account.id, zero)!)
        .reduce((a, b) => a.plus(b), zero);

      // show only assets that have at least one address in the wallet
      if (typeof balance !== 'undefined' && (includeEmpty || blockchainAccounts.length > 0)) {
        assets.push({
          balance
        });
      }
      const supportedTokens = registry.all()[code];
      if (typeof supportedTokens === 'undefined') {
        return;
      }

      supportedTokens.forEach((token) => {
        blockchainAccounts.forEach((account: WalletEntry) => {
          const balance = tokens.selectors.selectBalance(state, token.address, account.address!.value, code);
          if (balance && (includeEmpty || !balance.isZero())) {
            assets.push({
              balance
            });
          }
        });
      });
    });

  const bitcoinAccounts = wallet.entries.filter((e) => isBitcoinEntry(e)) as BitcoinEntry[];
  bitcoinAccounts.forEach((entry) => {
    const code = blockchainIdToCode(entry.blockchain);
    const zero = zeroAmountFor<BigAmount>(code);
    const balance = getBalance(state, entry.id, zero) || zero;
    assets.push({
      balance
    })
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
  const converted = assets
    .map((asset) => {
      const rate = settings.selectors.fiatRate(asset.balance.units.top.code, state) || 0;
      return asset.balance.getNumberByUnit(asset.balance.units.top).multipliedBy(rate)
    });

  if (converted.length === 0) {
    return undefined;
  }

  const total = converted.reduce((a, b) => a.plus(b));

  return {
    balance: new CurrencyAmount(total.multipliedBy(100), state.settings.localeCurrency),
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
    let token = asset.balance.units.top.code;
    let current = group[token];
    if (typeof current === 'undefined') {
      current = [];
    }
    current.push(asset);
    group[token] = current;
  });
  const result: IBalanceValue[] = [];
  Object.values(group)
    .map((g) => g.reduce((a: IBalanceValue, b: IBalanceValue) => {
      let balance = a.balance.plus(b.balance);
      return {
        balance
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
        rate: settings.selectors.fiatRate(asset.balance.units.top.code, state)
      } as BalanceValueConverted;
    })
    .filter((value) => typeof value.converted !== 'undefined' && typeof value.rate !== 'undefined');
}

export function getSeeds(state: IState): SeedDescription[] {
  return state[accounts.moduleName].seeds || []
}

export function getSeed(state: IState, id: Uuid): SeedDescription | undefined {
  return getSeeds(state).find((seed) => seed.id === id)
}

export function getUtxo(state: IState, entryId: EntryId): BalanceUtxo[] {
  return state[accounts.moduleName].details
    .filter((d) => d.entryId == entryId)
    .reduce((result, x) => {
      return result.concat(x.utxo || [])
    }, [] as BalanceUtxo[])
}

export function findLedgerSeed(state: IState): SeedDescription | undefined {
  return getSeeds(state).find((s) => s.type == "ledger")
}

export function isHardwareSeed(state: IState, seed: SeedReference): boolean {
  if (isLedger(seed)) {
    return true;
  }
  if (isIdSeedReference(seed)) {
    return getSeed(state, seed.value)?.type === "ledger";
  }
  return false
}