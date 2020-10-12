import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme} from "@material-ui/core";
import {accounts, IState, transaction} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import SetupTx from "./SetupTx";
import {EntryId, isBitcoinEntry} from "@emeraldpay/emerald-vault-core";
import {BlockchainCode, blockchainIdToCode} from "@emeraldwallet/core";
import {Alert} from "@material-ui/lab";
import Sign from "./Sign";
import {
  BitcoinEntry,
  isSeedPkRef,
  isSeedReference,
  UnsignedBitcoinTx,
  Uuid
} from "@emeraldpay/emerald-vault-core/lib/types";
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
const Component = (({entry, blockchain, seedId, source, onBroadcast}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [raw, setRaw] = React.useState("");
  const [page, setPage] = React.useState("setup" as Step);
  const [tx, setTx] = React.useState(null as UnsignedBitcoinTx | null);

  let content;

  if (page == "setup") {
    content = <SetupTx entry={entry} onCreate={(tx) => {
      setTx(tx);
      setPage("sign");
    }}/>
  } else if (page == "sign" && typeof tx == "object" && tx != null) {
    content = <Sign blockchain={blockchain}
                    tx={tx}
                    seedId={seedId}
                    entryId={source}
                    onSign={(raw) => {
                      setRaw(raw);
                      setPage("result")
                    }}/>
  } else if (page == "result") {
    content = <Confirm rawtx={raw}
                       onConfirm={() => onBroadcast(blockchain, tx!, raw)}
                       blockchain={blockchain}
                       entryId={entry.id}
    />
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
  entry: BitcoinEntry,
  blockchain: BlockchainCode,
  seedId: Uuid,
}

// Actions
interface Actions {
  onBroadcast: (blockchain: BlockchainCode, orig: UnsignedBitcoinTx, raw: string) => void;
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
    if (!isSeedPkRef(entry, entry.key)) {
      throw new Error("Not a seed entry");
    }
    let seedId = entry.key.seedId;
    return {
      blockchain: blockchainIdToCode(entry.blockchain),
      entry,
      seedId
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      onBroadcast: (blockchain, orig, raw) => {
        dispatch(transaction.actions.broadcastTx(blockchain, orig, raw));
      }
    }
  }
)((Component));