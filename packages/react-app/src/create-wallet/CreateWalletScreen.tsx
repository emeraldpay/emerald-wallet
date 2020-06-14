import {connect} from "react-redux";
import {accounts, hdpathPreview, IState, screen, settings} from "@emeraldwallet/store";
import * as React from "react";
import {Dispatch} from "react";
import {isSeedSelected, Result} from "./flow/types";
import CreateWalletWizard from "./CreateWalletWizard";
import * as vault from "@emeraldpay/emerald-vault-core";
import {Pages} from "@emeraldwallet/store/lib/screen";
import {blockchainCodeToId, Blockchains, IBlockchain} from "@emeraldwallet/core";

type Props = {
  seeds: vault.SeedDescription[],
  blockchains: IBlockchain[]
}
type Actions = {
  onCreate: (value: Result) => Promise<string>,
  onError: (err: any) => void,
  onCancel: () => void
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
          if (isSeedSelected(type) && typeof value.seedAccount == 'number') {
            const account: number = value.seedAccount;
            value.blockchains.forEach((blockchain) => {
              entries.push({
                type: "hd-path",
                blockchain: blockchainCodeToId(blockchain),
                key: {
                  hdPath: Blockchains[blockchain].params.hdPath.forAccount(account).toString(),
                  seedId: type.id,
                  password: value.seedPassword!
                }
              })
            })
          }
          dispatch(accounts.actions.createWallet(opts, entries, handler));
          dispatch(hdpathPreview.actions.clean());
        })
      },
      onCancel: () => {
        dispatch(screen.actions.gotoScreen(Pages.HOME));
        dispatch(hdpathPreview.actions.clean());
      }
    }
  }
)((Component));