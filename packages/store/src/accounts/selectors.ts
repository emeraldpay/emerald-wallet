import { BigAmount, CreateAmount } from '@emeraldpay/bigamount';
import {
  BitcoinEntry,
  EntryId,
  EntryIdOp,
  EthereumEntry,
  SeedDescription,
  SeedReference,
  Uuid,
  Wallet,
  WalletEntry,
  WalletOp,
  isBitcoinEntry,
  isEthereumEntry,
  isIdSeedReference,
  isLedger,
  isSeedPkRef,
} from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  CurrencyAmount,
  InputUtxo,
  TokenRegistry,
  amountDecoder,
  amountFactory,
  blockchainCodeToId,
  blockchainIdToCode,
} from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { createSelector } from 'reselect';
import { settings, tokens } from '../index';
import { IState } from '../types';
import { ConvertedBalance, moduleName } from './types';
import * as accounts from './index';

type AddressesBalance<T extends BigAmount> = { [address: string]: T };
type AddressesByBlockchain = Partial<Record<BlockchainCode, Set<string>>>;

/**
 * Aggregate multiple similar balances into one by summing all values
 */
export function aggregateBalances(balances: BigAmount[]): BigAmount[] {
  const grouped = balances.reduce<{ [key: string]: BigAmount[] }>((carry, balance) => {
    const { code } = balance.units.top;

    return {
      ...carry,
      [code]: [...(carry[code] ?? []), balance],
    };
  }, {});

  return Object.values(grouped).map((group) => group.reduce((first, second) => first.plus(second)));
}

export function allAsArray(state: IState): Wallet[] {
  return (state[moduleName].wallets ?? []).filter((value) => value != null);
}

export function zeroAmountFor<T extends BigAmount>(blockchain: BlockchainCode): T {
  const amountCreate = amountFactory(blockchain) as CreateAmount<T>;

  return amountCreate(0);
}

/**
 * Returns summary of all balances for the specified wallet
 */
export function getWalletBalances(
  state: IState,
  wallet: Wallet,
  includeEmpty = false,
  excludeAddresses?: AddressesByBlockchain,
): BigAmount[] {
  const balances: BigAmount[] = [];

  if (wallet == null) {
    return balances;
  }

  const ethereumAccounts = wallet.entries.filter((entry) => {
    const { address, blockchain, receiveDisabled } = entry;

    const isAvailable = !receiveDisabled && isEthereumEntry(entry);

    if (excludeAddresses == null || address == null) {
      return isAvailable;
    }

    return isAvailable && !excludeAddresses[blockchainIdToCode(blockchain)]?.has(address.value);
  }) as EthereumEntry[];

  [BlockchainCode.ETH, BlockchainCode.ETC, BlockchainCode.Goerli].forEach((blockchain) => {
    const zero = zeroAmountFor<BigAmount>(blockchain);

    const blockchainAccounts = ethereumAccounts.filter(
      (account: EthereumEntry) => account.blockchain === blockchainCodeToId(blockchain),
    );

    const balance = blockchainAccounts
      .map((account) => getBalance(state, account.id, zero))
      .reduce((first, second) => first.plus(second), zero);

    // Show only balances that have at least one address in the wallet
    if (balance != null && (includeEmpty || blockchainAccounts.length > 0)) {
      balances.push(balance);
    }

    const tokenRegistry = new TokenRegistry(state.application.tokens);
    const supportedTokens = tokenRegistry.byBlockchain(blockchain);

    supportedTokens.forEach((token) => {
      blockchainAccounts.forEach((account: WalletEntry) => {
        if (account.address != null) {
          const balance = tokens.selectors.selectBalance(state, blockchain, account.address.value, token.address);

          if (balance != null && (includeEmpty || balance.isPositive())) {
            balances.push(balance);
          }
        }
      });
    });
  });

  const bitcoinAccounts = wallet.entries.filter((entry) => {
    const { address, blockchain, receiveDisabled } = entry;

    const isAvailable = !receiveDisabled && isBitcoinEntry(entry);

    if (excludeAddresses == null || address == null) {
      return isAvailable;
    }

    return isAvailable && !excludeAddresses[blockchainIdToCode(blockchain)]?.has(address.value);
  }) as BitcoinEntry[];

  bitcoinAccounts.forEach(({ blockchain, id }) => {
    const blockchainCode = blockchainIdToCode(blockchain);

    const zero = zeroAmountFor<BigAmount>(blockchainCode);
    const balance = getBalance(state, id, zero);

    balances.push(balance);
  });

  return aggregateBalances(balances);
}

/**
 * Balances summarized by all wallets
 */
export function allBalances(state: IState): BigAmount[] {
  const balances: BigAmount[] = [];

  let knownAddresses: AddressesByBlockchain = {};

  state[moduleName].wallets.forEach((wallet) => {
    getWalletBalances(state, wallet, false, knownAddresses).forEach((balance) => balances.push(balance));

    knownAddresses = wallet.entries.reduce<AddressesByBlockchain>((carry, { address, blockchain, receiveDisabled }) => {
      if (receiveDisabled || address == null) {
        return carry;
      }

      const blockchainCode = blockchainIdToCode(blockchain);

      return { ...carry, [blockchainCode]: carry[blockchainCode]?.add(address.value) ?? new Set([address.value]) };
    }, knownAddresses);
  });

  return balances;
}

export function allWallets(state: IState): Wallet[] {
  return state[moduleName].wallets;
}

export const allEntries = createSelector([allWallets], (wallets) => {
  return wallets.reduce<WalletEntry[]>((all, wallet) => all.concat(wallet.entries), []);
});

export function allEntriesByBlockchain(state: IState, code: BlockchainCode): WalletEntry[] {
  return allEntries(state).filter((a: WalletEntry) => blockchainIdToCode(a.blockchain) === code);
}

export function getBalance<T extends BigAmount>(state: IState, entryId: string, defaultValue: T, onlyUtxo = false): T {
  const entry = findEntry(state, entryId);

  if (entry == null) {
    return defaultValue;
  }

  const addressesBalance = getAddressesBalance<T>(state, entryId, onlyUtxo);
  const zeroAmount = zeroAmountFor<T>(blockchainIdToCode(entry.blockchain));

  return Object.values(addressesBalance).reduce((carry, balance) => carry.plus(balance), zeroAmount);
}

export function balanceByChain<T extends BigAmount>(state: IState, blockchain: BlockchainCode): T {
  const zero = zeroAmountFor<T>(blockchain);

  return allEntriesByBlockchain(state, blockchain)
    .map((account: WalletEntry) => getBalance(state, account.id, zero))
    .reduce((first, second) => first.plus(second), zero);
}

/**
 * Calculate the total balance in currently selected fiat currency.
 * Returns undefined if a source is empty or if some input balance doesn't have an exchange rate defined yet.
 */
export function fiatTotalBalance(state: IState, balances: BigAmount[]): CurrencyAmount | undefined {
  const converted = balances
    .map((balance) => {
      const rate = settings.selectors.fiatRate(state, balance);

      if (rate == null) {
        return null;
      }

      return balance.getNumberByUnit(balance.units.top).multipliedBy(rate);
    })
    .filter((balance): balance is BigNumber => balance != null);

  if (converted.length === 0) {
    return undefined;
  }

  const total = converted.reduce((carry, balance) => carry.plus(balance));

  return new CurrencyAmount(total.multipliedBy(100), state.settings.localeCurrency);
}

export function findAccountByAddress(state: IState, address: string, chain: BlockchainCode): WalletEntry | undefined {
  return allEntries(state).find((entry) => {
    if (blockchainCodeToId(chain) != entry.blockchain) {
      return false;
    }

    if (isEthereumEntry(entry)) {
      return entry.address?.value == address;
    }

    return false;
  });
}

export function findEntry(state: IState, id: EntryId): WalletEntry | undefined {
  const wallet = findWalletByEntryId(state, id);

  if (wallet == null) {
    return undefined;
  }

  return wallet.entries.find((entry) => entry.id === id);
}

export function findLedgerSeed(state: IState): SeedDescription | undefined {
  return getSeeds(state).find((seed) => seed.type === 'ledger');
}

export function findWallet(state: IState, id: Uuid): Wallet | undefined {
  return allWallets(state).find((wallet) => wallet.id === id);
}

export function findWalletByAddress(state: IState, address: string, blockchain: BlockchainCode): Wallet | undefined {
  if (address == null) {
    return undefined;
  }

  return allWallets(state).find((wallet: Wallet) =>
    WalletOp.of(wallet).findEntryByAddress(address, blockchainCodeToId(blockchain)),
  );
}

export function findWalletByEntryId(state: IState, id: EntryId): Wallet | undefined {
  const walletId = EntryIdOp.asOp(id).extractWalletId();

  return findWallet(state, walletId);
}

export function getAddressesBalance<T extends BigAmount>(
  state: IState,
  entryId: string,
  onlyUtxo = false,
): AddressesBalance<T> {
  const entry = findEntry(state, entryId);

  if (entry == null) {
    return {};
  }

  const blockchainCode = blockchainIdToCode(entry.blockchain);

  const amountDecode = amountDecoder<T>(blockchainCode);
  const zeroAmount = zeroAmountFor<T>(blockchainCode);

  const entryDetails = state[moduleName].details.filter((details) => details.entryId === entryId);

  if (entryDetails.length === 0) {
    return {};
  }

  if (isBitcoinEntry(entry)) {
    return entryDetails.reduce<AddressesBalance<T>>((carry, { address, balance, utxo }) => {
      if (balance == null) {
        return carry;
      }

      if (!onlyUtxo && utxo == null) {
        return {
          ...carry,
          [address]: amountDecode(balance).plus(carry[address] ?? zeroAmount),
        };
      }

      const decoder = amountDecoder<T>(blockchainCode);

      return (
        utxo?.reduce(
          (utxoCarry, { value }) => ({
            ...utxoCarry,
            [address]: decoder(value).plus(utxoCarry[address] ?? zeroAmount),
          }),
          carry,
        ) ?? carry
      );
    }, {});
  }

  if (isEthereumEntry(entry) && entry.address != null) {
    const { value: address } = entry.address;

    return entryDetails
      .map((details) => details.balance)
      .filter((balance): balance is string => balance != null)
      .reduce<AddressesBalance<T>>(
        (carry, balance) => ({
          ...carry,
          [address]: amountDecode(balance).plus(carry[address] ?? zeroAmount),
        }),
        {},
      );
  }

  return {};
}

export function getSeeds(state: IState): SeedDescription[] {
  return state[accounts.moduleName].seeds ?? [];
}

export function getSeed(state: IState, id: Uuid): SeedDescription | undefined {
  return getSeeds(state).find((seed) => seed.id === id);
}

export function getUtxo(state: IState, entryId: EntryId): InputUtxo[] {
  return state[accounts.moduleName].details
    .filter((details) => details.entryId == entryId)
    .reduce((result, x) => {
      return result.concat(x.utxo ?? []);
    }, [] as InputUtxo[]);
}

export function isHardwareSeed(state: IState, seed: SeedReference): boolean {
  if (isLedger(seed)) {
    return true;
  }

  if (isIdSeedReference(seed)) {
    return getSeed(state, seed.value)?.type === 'ledger';
  }

  return false;
}

export function isHardwareEntry(state: IState, entry: WalletEntry): boolean | undefined {
  if (entry.key == null) {
    return undefined;
  }
  if (isSeedPkRef(entry, entry.key)) {
    return isHardwareSeed(state, {type: 'id', value: entry.key.seedId});
  }
  return false
}


export function isLoading(state: IState): boolean {
  return state[moduleName].loading;
}

/**
 * Convert balance to fiat and return source balance
 */
export function withFiatConversion<T extends BigAmount>(
  state: IState,
  balance: T[],
  onlyFiat = false,
): ConvertedBalance<T>[] {
  const conversions = balance.map((balance) => ({ balance, fiatBalance: fiatTotalBalance(state, [balance]) }));

  if (onlyFiat) {
    return conversions.filter(({ fiatBalance }) => fiatBalance != null);
  }

  return conversions;
}
