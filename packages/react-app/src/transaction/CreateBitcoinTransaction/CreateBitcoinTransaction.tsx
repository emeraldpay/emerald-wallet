import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme} from "@material-ui/core";
import {accounts, IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import SetupTx from "./SetupTx";
import {CreateBitcoinTx} from "@emeraldwallet/core/lib/workflow";
import {BigAmount} from "@emeraldpay/bigamount";
import {EntryId, isBitcoinEntry} from "@emeraldpay/emerald-vault-core";
import TxSummary from "./TxSummary";
import {BlockchainCode, blockchainIdToCode} from "@emeraldwallet/core";
import {Alert} from "@material-ui/lab";
import Sign from "./Sign";
import {isSeedPkRef, isSeedReference, Uuid} from "@emeraldpay/emerald-vault-core/lib/types";
import Confirm from "./Confirm";
import {Back} from "@emeraldplatform/ui-icons";
import {Page} from "@emeraldplatform/ui";

type Step = "setup" | "sign" | "result";

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
const Component = (({create, blockchain, seedId, source}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [raw, setRaw] = React.useState("");
  const [page, setPage] = React.useState("setup" as Step);

  let content = null;

  if (page == "setup") {
    content = <SetupTx create={create} onCreate={() => setPage("sign")}/>
  } else if (page == "sign") {
    content = <Sign create={create}
                    blockchain={blockchain}
                    seedId={seedId}
                    entryId={source}
                    onSign={(raw) => {
                      setRaw(raw);
                      setPage("result")
                    }}/>
  } else if (page == "result") {
    content = <Confirm rawtx={raw} onConfirm={() => {
    }}/>
  } else {
    console.error("Invalid state", page);
    content = <Alert severity="error">Invalid state</Alert>
  }

  return <Page
    title={"Create Bitcoin Transaction"}
    leftIcon={<Back onClick={() => {
    }}/>}>
    {content}
  </Page>
})

// State Properties
interface Props {
  create: CreateBitcoinTx<BigAmount>,
  blockchain: BlockchainCode,
  seedId: Uuid,
}

// Actions
interface Actions {
}

// Component properties
interface OwnProps {
  source: EntryId;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    let entry = accounts.selectors.findEntry(state, ownProps.source);
    if (!entry) {
      throw new Error("Entry not found: " + ownProps.source);
    }
    if (!isBitcoinEntry(entry)) {
      throw new Error("Not bitcoin type of entry: " + entry.id + " (as " + entry.blockchain + ")");
    }
    let utxo = accounts.selectors.getUtxo(state, entry.id);
    if (!isSeedPkRef(entry, entry.key)) {
      throw new Error("Not a seed entry")
    }
    let seedId = entry.key.seedId;
    return {
      create: new CreateBitcoinTx<BigAmount>(entry, utxo),
      blockchain: blockchainIdToCode(entry.blockchain),
      seedId
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));