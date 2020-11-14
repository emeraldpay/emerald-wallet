import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme} from "@material-ui/core";
import {IState, wallet, screen, txhistory, accounts, blockchains, settings} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {
  BlockchainCode,
  blockchainByName,
  blockchainById,
  isEthereumStoredTransaction,
  IStoredTransaction, AnyCoinCode, isBitcoinStoredTransaction
} from "@emeraldwallet/core";
import {ITokenInfo, registry} from '@emeraldwallet/erc20';
import i18n from '../../../i18n';
import {Wallet} from "@emeraldpay/emerald-vault-core";
import {TxItem} from "./TxItemView/TxItem";
import {EntryIdOp} from "@emeraldpay/emerald-vault-core";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    // styleName: {
    //  ... css
    // },
  })
);

/**
 *
 */
const Component = ((props: Props & Actions & OwnProps) => {
  const styles = useStyles();
  return <TxItem tx={props.tx}
                 fromWallet={props.fromAccount}
                 toWallet={props.toAccount}
                 classes={{}}
                 openAccount={props.openAccount}
                 currentBlockHeight={props.currentBlockHeight}
                 openTx={props.openTx}
                 requiredConfirmations={props.requiredConfirmations}
  />
})

// State Properties
interface Props {
  tx: IStoredTransaction;
  coinTicker: AnyCoinCode;
  lang: string;
  toAccount: Wallet | undefined;
  fromAccount: Wallet | undefined;
  token: ITokenInfo | null;
  requiredConfirmations: number;
  currentBlockHeight: number;
}

// Actions
interface Actions {
  openAccount: (blockchain: BlockchainCode, address: string) => void;
  openTx: () => void;
}

// Component properties
interface OwnProps {
  hash: string;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const tx = txhistory.selectors.selectByHash(state, ownProps.hash);
    if (!tx) {
      throw new Error("Unknown tx: " + ownProps.hash);
    }
    const blockchain = blockchainByName(tx.blockchain);
    let toAccount: Wallet | undefined = undefined;
    let fromAccount: Wallet | undefined = undefined;
    let token: ITokenInfo | null = null;
    if (isEthereumStoredTransaction(tx)) {
      toAccount = accounts.selectors.findWalletByAddress(state, tx.to || "", blockchain!.params.code) || undefined;
      fromAccount = accounts.selectors.findWalletByAddress(state, tx.from, blockchain!.params.code) || undefined;
      token = registry.byAddress(blockchain!.params.code, tx.to || "");

    } else if (isBitcoinStoredTransaction(tx)) {
      // try to find an input that originated from us
      tx.inputs
        .filter((it) => typeof it.entryId != "undefined")
        .map((it) => accounts.selectors.findEntry(state, it.entryId!))
        .filter((it) => typeof it != "undefined")
        .slice(0, 1)
        .forEach((from) =>
          fromAccount = accounts.selectors.findWallet(state, EntryIdOp.asOp(from!.id).extractWalletId())
        );

      // bitcoin tx usually have a change, which is own account. because of that consider it as "to" only if
      // it's not originated from us
      if (typeof fromAccount === "undefined") {
        tx.outputs
          .filter((it) => typeof it.entryId != "undefined")
          .map((it) => accounts.selectors.findEntry(state, it.entryId!))
          .filter((it) => typeof it != "undefined")
          .slice(0, 1)
          .forEach((to) =>
            toAccount = accounts.selectors.findWallet(state, EntryIdOp.asOp(to!.id).extractWalletId())
          );
      }
    }

    return {
      coinTicker: blockchain!.params.coinTicker,
      // amountRenderer: txValueRenderer(showFiat),
      lang: i18n.language,
      tx,
      toAccount,
      fromAccount,
      token,
      requiredConfirmations: blockchain.params.confirmations,
      currentBlockHeight: blockchains.selectors.getHeight(state, blockchain!.params.coinTicker)
    };

  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      openTx: (): void => {
        const {hash} = ownProps;
        dispatch(screen.actions.gotoScreen(screen.Pages.TX_DETAILS, {hash}));
      },
      openAccount: (blockchain: BlockchainCode, address: string): void => {
        dispatch(wallet.actions.openAccountDetails(blockchain, address));
      }
    }
  }
)((Component));
