import {IAddressState, isEqualSeed} from "./types";
import {IState} from "../types";
import {AnyCoinCode, BlockchainCode, Blockchains, HDPath} from "@emeraldwallet/core";
import {SeedReference} from "@emeraldpay/emerald-vault-core";
import {isLedger} from "@emeraldpay/emerald-vault-core";
import * as accountSelectors from "../accounts/selectors";
import {isIdSeedReference} from "@emeraldpay/emerald-vault-core/lib/types";

export function getByAccount(state: IState, seed: SeedReference, account: number): IAddressState[] {
  if (!state.hdpathPreview) {
    return [];
  }
  if (!state.hdpathPreview.accounts) {
    return [];
  }
  return state.hdpathPreview.accounts.filter((acc) =>
    isEqualSeed(seed, acc.seed) && HDPath.parse(acc.hdpath).account == account
  )
}

export function getLedgerXpub(state: IState, account: string): string | undefined {
  let data = state.hdpathPreview;
  if (!data) {
    return undefined;
  }
  return data.accounts.find((e) => (
    isLedger(e.seed) || (isIdSeedReference(e.seed) && accountSelectors.getSeed(state, e.seed.value)?.type == "ledger")
  ) && e.hdpath == account)?.address
}

export function getCurrentDisplay(state: IState, seed: SeedReference): IAddressState[] {
  let data = state.hdpathPreview;
  if (!data) {
    return [];
  }
  return data.display.entries
    .map((e) => {
      let fullHDPath = HDPath.parse(e.hdpath);
      let accountHDPath: HDPath = fullHDPath.asAccount();
      if (fullHDPath.isAccount()) {
        fullHDPath = accountHDPath.forAddress(0, 0);
      }
      const existing = data!.accounts.find((it) => it.blockchain == e.blockchain && it.hdpath == fullHDPath.toString());
      if (existing) {
        const asAccount = data!.accounts.find((it) => it.blockchain == e.blockchain && it.hdpath == accountHDPath.toString());
        if (asAccount) {
          existing.xpub = asAccount.address;
        }
        return existing
      } else {
        return {
          blockchain: e.blockchain,
          asset: Blockchains[e.blockchain].params.coinTicker,
          seed,
          hdpath: e.hdpath
        }
      }
    })
}