import {connect} from "react-redux";
import {accounts, IState, screen} from "@emeraldwallet/store";
import * as React from "react";
import {Dispatch} from "react";
import {Result} from "./types";
import CreateWalletWizard from "./CreateWalletWizard";
import * as vault from "@emeraldpay/emerald-vault-core";
import {Pages} from "@emeraldwallet/store/lib/screen";

type Props = {
  seeds: vault.SeedDescription[]
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
      seeds: accounts.selectors.getSeeds(state)
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
          dispatch(accounts.actions.createWallet(opts, handler))
        })
      },
      onCancel: () => {
        dispatch(screen.actions.gotoScreen(Pages.HOME))
      }
    }
  }
)((Component));