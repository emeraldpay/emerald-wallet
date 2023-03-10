import { SeedReference, isIdSeedReference, isLedger } from '@emeraldpay/emerald-vault-core';
import { Blockchains, HDPath } from '@emeraldwallet/core';
import { Entry, HDPathAddresses, IAddressState, isEqualSeed } from './types';
import * as accountSelectors from '../accounts/selectors';
import { IState } from '../types';

export function getByAccount(state: IState, seed: SeedReference, account: number): IAddressState[] {
  if (!state.hdpathPreview || !state.hdpathPreview.accounts) {
    return [];
  }

  return state.hdpathPreview.accounts.filter(
    (item) => isEqualSeed(seed, item.seed) && HDPath.parse(item.hdpath).account === account,
  );
}

export function getLedgerXpub(state: IState, account: string): string | undefined {
  if (state.hdpathPreview == null) {
    return undefined;
  }

  return state.hdpathPreview.accounts.find(
    (item) =>
      (isLedger(item.seed) ||
        (isIdSeedReference(item.seed) && accountSelectors.getSeed(state, item.seed.value)?.type === 'ledger')) &&
      item.hdpath === account,
  )?.address;
}

function getByEntry(state: IState, entry: Entry, seed: SeedReference): IAddressState {
  let fullHDPath = HDPath.parse(entry.hdpath);

  const accountHDPath: HDPath = fullHDPath.asAccount();

  if (fullHDPath.isAccount()) {
    fullHDPath = accountHDPath.forAddress(0, 0);
  }

  const { accounts = [] } = state.hdpathPreview ?? {};

  const existing = accounts.find(
    (item) => item.blockchain === entry.blockchain && item.hdpath === fullHDPath.toString(),
  );

  if (existing == null) {
    return {
      seed,
      asset: Blockchains[entry.blockchain].params.coinTicker,
      blockchain: entry.blockchain,
      hdpath: fullHDPath.toString(),
    };
  }

  const account = accounts.find(
    (item) => item.blockchain === entry.blockchain && item.hdpath === accountHDPath.toString(),
  );

  if (account != null) {
    existing.xpub = account.address;
  }

  return existing;
}

export function getCurrentDisplay(state: IState, seed: SeedReference): IAddressState[] {
  return state.hdpathPreview?.display.entries.map((entry) => getByEntry(state, entry, seed)) ?? [];
}

export function getCurrentAddresses(state: IState): HDPathAddresses {
  const { accounts = [], display } = state.hdpathPreview ?? {};
  const { entries = [] } = display ?? {};

  return entries.reduce((carry, entry) => {
    const account = accounts.find(
      (item) =>
        item.blockchain === entry.blockchain &&
        (item.hdpath === entry.hdpath || item.hdpath === HDPath.parse(entry.hdpath).asAccount().toString()),
    );

    if (account?.xpub == null && account?.address == null) {
      return carry;
    }

    return {
      ...carry,
      [account.blockchain]: account.xpub ?? account.address,
    };
  }, {});
}
