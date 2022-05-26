import { isLedger, SeedReference } from '@emeraldpay/emerald-vault-core';
import { IdSeedReference, isIdSeedReference } from '@emeraldpay/emerald-vault-core/lib/types';
import { Blockchains, HDPath, isBitcoin, isEthereum } from '@emeraldwallet/core';
import * as accountSelectors from '../accounts/selectors';
import { IState } from '../types';
import { Entry, IAddressState, isEqualSeed } from './types';

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

  const existing = state.hdpathPreview?.accounts.find(
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

  const asAccount = state.hdpathPreview?.accounts.find(
    (item) => item.blockchain === entry.blockchain && item.hdpath === accountHDPath.toString(),
  );

  if (asAccount != null) {
    existing.xpub = asAccount.address;
  }

  return existing;
}

export function getCurrentDisplay(state: IState, seed: SeedReference): IAddressState[] {
  if (state.hdpathPreview == null) {
    return [];
  }

  return state.hdpathPreview.display.entries.map((entry) => getByEntry(state, entry, seed));
}

export function isPreloaded(state: IState): boolean {
  if (state.hdpathPreview == null) {
    return false;
  }

  const emptySeed: IdSeedReference = {
    type: 'id',
    value: 'none',
  };

  return state.hdpathPreview.display.entries.every((entry) => {
    const full = getByEntry(state, entry, emptySeed);

    return (
      (isBitcoin(full.blockchain) && full.xpub != null && full.xpub.length > 0) ||
      (isEthereum(full.blockchain) && full.address != null && full.address.length > 0)
    );
  });
}
