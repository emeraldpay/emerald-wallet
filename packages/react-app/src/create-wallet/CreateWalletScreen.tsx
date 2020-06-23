import {connect} from "react-redux";
import {accounts, hdpathPreview, IState, screen, settings} from "@emeraldwallet/store";
import * as React from "react";
import {Dispatch} from "react";
import {isLedger, isPk, isPkJson, isPkRaw, isSeedCreate, isSeedSelected, Result} from "./flow/types";
import CreateWalletWizard from "./CreateWalletWizard";
import * as vault from "@emeraldpay/emerald-vault-core";
import {Pages} from "@emeraldwallet/store/lib/screen";
import {BlockchainCode, blockchainCodeToId, Blockchains, IBlockchain} from "@emeraldwallet/core";
import {
  AddEntry,
  IdSeedReference, LedgerSeedReference,
  SeedDefinition,
  SeedEntry,
  SeedReference,
  Uuid
} from "@emeraldpay/emerald-vault-core";

type Props = {
  seeds: vault.SeedDescription[],
  blockchains: IBlockchain[]
}
type Actions = {
  onCreate: (value: Result) => Promise<string>,
  onError: (err: any) => void,
  onCancel: () => void,
  mnemonicGenerator?: () => Promise<string>,
  onSaveSeed: (seed: SeedDefinition) => Promise<string>
}

/**
 * App Screen for the Create Wallet Wizard
 * @see CreateWalletWizard
 */
const Component = ((props: Props & Actions & OwnProps) => {
  return <CreateWalletWizard {...props}/>
})

type OwnProps = {}

function entriesForBlockchains(seedRef: SeedReference, account: number, blockchains: BlockchainCode[]): AddEntry[] {
  const entries: vault.AddEntry[] = [];
  blockchains.forEach((blockchain) => {
    const key: SeedEntry = {
      hdPath: Blockchains[blockchain].params.hdPath.forAccount(account).toString(),
      seed: seedRef
    };
    entries.push({
      type: "hd-path",
      blockchain: blockchainCodeToId(blockchain),
      key
    })
  });
  return entries;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {
      seeds: accounts.selectors.getSeeds(state),
      blockchains: settings.selectors.currentChains(state)
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      onError: screen.actions.catchError(dispatch),
      onCreate: (value: Result) => {
        return new Promise((resolve, reject) => {
          const handler = (walletId?: string, err?: any) => {
            if (err) {
              reject(err)
            } else {
              resolve(walletId);
            }
          };
          const opts = {
            label: value.options.label
          };
          const entries: vault.AddEntry[] = [];
          const type = value.type;
          if (isSeedSelected(type) || isSeedCreate(type)) {
            const seed = value.seed;
            if (typeof seed == "object" && seed.type == "id" && seed.password && typeof value.seedAccount == 'number') {
              const account: number = value.seedAccount;
              entriesForBlockchains(value.seed!, account, value.blockchains)
                .forEach((e) => entries.push(e));
            } else {
              console.warn("Account number is not set")
            }
          } else if (isPk(type)) {
            if (isPkJson(type)) {
              entries.push({
                type: "ethereum-json",
                key: type.json,
                blockchain: blockchainCodeToId(value.blockchains[0])
              })
            } else if (isPkRaw(type)) {
              entries.push({
                type: "raw-pk-hex",
                key: type.pk,
                password: type.password,
                blockchain: blockchainCodeToId(value.blockchains[0])
              })
            }
          } else if (isLedger(type)) {
            if (typeof value.seedAccount == 'number') {
              const account: number = value.seedAccount;
              const seedRef: LedgerSeedReference = {
                type: "ledger"
              }
              entriesForBlockchains(seedRef, account, value.blockchains)
                .forEach((e) => entries.push(e));
            } else {
              console.warn("Account number is not set")
            }
          }
          dispatch(accounts.actions.createWallet(opts, entries, handler));
          dispatch(hdpathPreview.actions.clean());
        })
      },
      mnemonicGenerator: () => {
        return new Promise((resolve) =>
          dispatch(accounts.actions.generateMnemonic(resolve))
        );
      },
      onSaveSeed: (seed: SeedDefinition) => {
        return new Promise<string>((resolve) =>
          dispatch(accounts.actions.createSeed(seed, resolve))
        );
      },
      onCancel: () => {
        dispatch(screen.actions.gotoScreen(Pages.HOME));
        dispatch(hdpathPreview.actions.clean());
      }
    }
  }
)((Component));