import {connect} from "react-redux";
import {accounts, hdpathPreview, IState, screen, settings} from "@emeraldwallet/store";
import * as React from "react";
import {Dispatch} from "react";
import {isSeedCreate, isSeedSelected, Result} from "./flow/types";
import CreateWalletWizard from "./CreateWalletWizard";
import * as vault from "@emeraldpay/emerald-vault-core";
import {Pages} from "@emeraldwallet/store/lib/screen";
import {blockchainCodeToId, Blockchains, IBlockchain} from "@emeraldwallet/core";
import {SeedDefinition} from "@emeraldpay/emerald-vault-core";

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
            const unlock = value.unlock;
            if (typeof unlock == "object" && unlock.id && unlock.password && typeof value.seedAccount == 'number') {
              const account: number = value.seedAccount;
              value.blockchains.forEach((blockchain) => {
                entries.push({
                  type: "hd-path",
                  blockchain: blockchainCodeToId(blockchain),
                  key: {
                    hdPath: Blockchains[blockchain].params.hdPath.forAccount(account).toString(),
                    seedId: unlock.id,
                    password: unlock.password
                  }
                })
              })
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