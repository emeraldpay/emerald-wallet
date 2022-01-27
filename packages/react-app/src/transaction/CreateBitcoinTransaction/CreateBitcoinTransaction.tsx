import { EntryId, isBitcoinEntry } from "@emeraldpay/emerald-vault-core";
import { BitcoinEntry, isSeedPkRef, UnsignedBitcoinTx, Uuid } from "@emeraldpay/emerald-vault-core/lib/types";
import { Page } from "@emeraldplatform/ui";
import {Back} from "@emeraldplatform/ui-icons";
import {BalanceUtxo, BlockchainCode, blockchainIdToCode} from "@emeraldwallet/core";
import { accounts, IState, screen, transaction } from "@emeraldwallet/store";
import {createStyles, Theme, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Alert} from "@material-ui/lab";
import * as React from "react";
import {Dispatch} from "react";
import {connect} from "react-redux";
import Confirm from "./Confirm";
import SetupTx from "./SetupTx";
import Sign from "./Sign";
import {CreateBitcoinTx} from "@emeraldwallet/core/lib/workflow";
import {BigAmount} from "@emeraldpay/bigamount";

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
const Component = (({entry, blockchain, seedId, utxo, source, getFees, onBroadcast, onCancel}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [raw, setRaw] = React.useState("");
  const [page, setPage] = React.useState("setup" as Step);
  const [txBuilder, setTxBuilder] = React.useState(null as CreateBitcoinTx<BigAmount> | null);
  const [tx, setTx] = React.useState(null as UnsignedBitcoinTx | null);

  React.useEffect(() => {
    // make sure we setup the Tx Builder only once, otherwise it loses configuration options
    const txBuilder = new CreateBitcoinTx<BigAmount>(entry, utxo);
    setTxBuilder(txBuilder)
  }, [entry.id])

  let content;

  if (page == "setup") {
    if (txBuilder != null) {
      content = (
        <SetupTx
          create={txBuilder}
          entry={entry}
          source={source}
          getFees={getFees(blockchain)}
          onCreate={(tx) => {
            setTx(tx);
            setPage("sign");
          }}
        />
      );
    } else {
      content = <Typography>Initializing...</Typography>
    }
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
    leftIcon={<Back onClick={onCancel}/>}>
    {content}
  </Page>
})

// State Properties
interface Props {
  entry: BitcoinEntry;
  blockchain: BlockchainCode;
  seedId: Uuid;
  utxo: BalanceUtxo[];
}

// Actions
interface Actions {
  onBroadcast: (blockchain: BlockchainCode, orig: UnsignedBitcoinTx, raw: string) => void;
  onCancel?: () => void;
  getFees: (blockchain: BlockchainCode) => () => Promise<any>;
}

// Component properties
interface OwnProps {
  source: EntryId;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const entry = accounts.selectors.findEntry(state, ownProps.source);
    if (!entry) {
      throw new Error("Entry not found: " + ownProps.source);
    }
    if (!isBitcoinEntry(entry)) {
      throw new Error("Not bitcoin type of entry: " + entry.id + " (as " + entry.blockchain + ")");
    }
    if (!isSeedPkRef(entry, entry.key)) {
      throw new Error("Not a seed entry");
    }
    const seedId = entry.key.seedId;
    const utxo = accounts.selectors.getUtxo(state, entry.id);
    return {
      blockchain: blockchainIdToCode(entry.blockchain),
      entry,
      seedId,
      utxo,
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      getFees: (blockchain) => async () => {
        const [avgLast, avgMiddle, avgTail5] = await Promise.all([
          dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgLast')),
          dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgMiddle')),
          dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgTail5')),
        ]);

        return {
          avgLast,
          avgMiddle,
          avgTail5,
        };
      },
      onBroadcast: (blockchain, orig, raw) => {
        dispatch(transaction.actions.broadcastTx(blockchain, orig, raw));
        // when a change output was used
        if (orig.outputs.length > 1) {
          dispatch(accounts.actions.nextAddress(ownProps.source, "change"));
        }
      },
      onCancel: () => dispatch(screen.actions.gotoScreen(screen.Pages.HOME, ownProps.source)),
    }
  }
)((Component));
