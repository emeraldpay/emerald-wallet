import { AccountState, HDPreviewState, isEqualSeed, isNonPartial } from './types';

function replace<T>(input: T[], index: number, value: T): T[] {
  const output = [...input];

  if (index === -1) {
    return [...output, value];
  }

  output.splice(index, 1, value);

  return output;
}

function isSame(actual: AccountState, query: Partial<AccountState>): boolean {
  /**
   * To compare it needs either chain + asset + seed + hd | address
   */
  if (query.seed != null && !isEqualSeed(actual.seed, query.seed)) {
    return false;
  }

  /**
   * Either HDPath or address must match. But address may be missing in the query, when it's only loading
   */
  if (query.hdpath != null && query.hdpath !== actual.hdpath) {
    return false;
  }

  if (query.address == null) {
    if (query.address !== actual.address) {
      return false;
    }

    throw new Error('HDPath or Address id must present');
  }

  return query.blockchain === actual.blockchain && query.asset === actual.asset;
}

export function mergeAddress(state: HDPreviewState, value: AccountState | Partial<AccountState>): HDPreviewState {
  const index = state.accounts.findIndex((account) => isSame(account, value));

  if (index === -1) {
    if (isNonPartial(value)) {
      return {
        ...state,
        accounts: [...state.accounts, value],
      };
    }

    throw new Error("Value doesn't have all values to insert as a new instance");
  }

  return {
    ...state,
    accounts: replace(state.accounts, index, { ...state.accounts[index], ...value }),
  };
}
