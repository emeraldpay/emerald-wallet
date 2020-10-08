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
  IStoredTransaction, AnyCoinCode, isBitcoinStoredTransaction, isEthereum, EthereumStoredTransaction
} from "@emeraldwallet/core";
import {ITokenInfo, registry} from '@emeraldwallet/erc20';
import i18n from '../../../i18n';
import {EntryId, WalletEntry} from "@emeraldpay/emerald-vault-core/lib/types";
import {EthereumTxItem} from "./TxItemView/EthereumTxItem";
import Alert from "@material-ui/lab/Alert";

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
  if (isEthereum(props.tx.blockchain) && isEthereumStoredTransaction(props.tx)) {
    return <EthereumTxItem tx={props.tx}
                           classes={{}}
                           openAccount={props.openAccount}
                           currentBlockHeight={props.currentBlockHeight}
                           openTx={props.openTx}
                           requiredConfirmations={props.requiredConfirmations}
    />
  }
  return <Alert>Invalid tx on {props.tx.blockchain}</Alert>
})

// State Properties
interface Props {
  tx: IStoredTransaction;
  coinTicker: AnyCoinCode;
  lang: string;
  toAccount: WalletEntry | undefined;
  fromAccount: WalletEntry | undefined;
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
    let toAccount: WalletEntry | undefined = undefined;
    let fromAccount: WalletEntry | undefined = undefined;
    let token: ITokenInfo | null = null;
    if (isEthereumStoredTransaction(tx)) {
      toAccount = accounts.selectors.findAccountByAddress(state, tx.to || "", blockchain!.params.code) || undefined;
      fromAccount = accounts.selectors.findAccountByAddress(state, tx.from, blockchain!.params.code) || undefined;
      token = registry.byAddress(blockchain!.params.code, tx.to || "");
    } else if (isBitcoinStoredTransaction(tx)) {

    }

    return {
      coinTicker: blockchain!.params.coinTicker,
      // amountRenderer: txValueRenderer(showFiat),
      lang: i18n.language,
      tx,
      toAccount,
      fromAccount,
      token,
      requiredConfirmations: settings.selectors.numConfirms(state),
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
