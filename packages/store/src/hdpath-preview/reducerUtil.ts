import {IAddressState, IHDPreviewState, isEqualSeed, isNonPartial, SeedRef} from "./types";


function replace<T>(arr: T[], pos: number, value: T): T[] {
  if (pos == -1) {
    return arr.concat(value)
  } else {
    return arr.map((it, i) => {
      if (i == pos) {
        return value
      } else {
        return it
      }
    });
  }
}

function isSame(actual: IAddressState, query: Partial<IAddressState>): boolean {
  // to compare it needs either chain + asset + seed + hd | address

  if (query.seed) {
    if (!isEqualSeed(actual.seed, query.seed)) {
      return false;
    }
  }
  // either hdpath or address must match. but address may be missing in the query, when it's only loading
  if (query.hdpath) {
    if (query.hdpath != actual.hdpath) {
      return false;
    }
  } else if (query.address) {
    if (query.address != actual.address) {
      return false;
    }
  } else {
    throw new Error("HDPath or Address id must present")
  }
  return query.blockchain == actual.blockchain && query.asset == actual.asset;
}

/**
 * Add address details, or merge into the existing
 * @param state
 * @param value
 */
export function mergeAddress(state: IHDPreviewState,
                             value: IAddressState | Partial<IAddressState>): IHDPreviewState {
  const pos = state.accounts.findIndex((c) =>
    isSame(c, value)
  );
  if (pos == -1) {
    if (isNonPartial(value)) {
      return {
        ...state,
        accounts: state.accounts.concat(value)
      }
    }
    throw new Error("Value doesn't have all values to insert as a new instance")
  }
  const current = state.accounts[pos];
  const merged = {
    ...current,
    ...value
  }
  return {
    ...state,
    accounts: replace(state.accounts, pos, merged)
  };
}