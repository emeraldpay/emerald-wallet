import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, TextField, Theme, Typography} from "@material-ui/core";
import {accounts, IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import * as bitcoin from "bitcoinjs-lib";
import {EntryId} from "@emeraldpay/emerald-vault-core/lib/types";
import {amountDecoder, amountFactory, BlockchainCode} from "@emeraldwallet/core";
import {BigAmount} from "@emeraldpay/bigamount";
import FormFieldWrapper from "../CreateTx/FormFieldWrapper";
import FormLabel from "../CreateTx/FormLabel/FormLabel";
import classNames from "classnames";
import {Address, TxRef} from "@emeraldwallet/ui";
import {Alert} from "@material-ui/lab";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    inputField: {
      flexGrow: 5
    },
  })
);

/**
 *
 */
const Component = (({parsed}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  return <Box>
    <FormFieldWrapper>
      <FormLabel>From</FormLabel>
      <Box className={classNames(styles.inputField)}>
        {parsed.inputs.map((input) =>
          <Box>
            {input.address && <Address address={input.address}/>}
            {typeof input.address == "undefined" && <TxRef txid={input.txid} vout={input.vout}/>}
            {!input.amount.isZero() && <Typography>{input.amount.toString()}</Typography>}
          </Box>
        )}
      </Box>
    </FormFieldWrapper>
    <FormFieldWrapper>
      <FormLabel>To</FormLabel>
      <Box className={classNames(styles.inputField)}>
        {parsed.outputs.map((output) =>
          <Box>
            <Address address={output.address}/>
            <Typography>{output.amount.toString()}</Typography>
          </Box>
        )}
      </Box>
    </FormFieldWrapper>
    <FormFieldWrapper>
      <FormLabel>Fee</FormLabel>
      <Box className={classNames(styles.inputField)}>
        {parsed.fee ? <Typography>{parsed.fee.toString()}</Typography> :
          <Alert severity={"warning"} color={"warning"}>Unknown Fee. May be invalid.</Alert>}
      </Box>
    </FormFieldWrapper>
  </Box>
})

// State Properties
interface Props {
  parsed: Parsed
}

// Actions
interface Actions {
}

// Component properties
interface OwnProps {
  rawtx: string,
  entryId: EntryId,
  blockchain: BlockchainCode
}

type Parsed = {
  inputs: {
    txid: string,
    vout: number,
    address?: string,
    amount: BigAmount,
  }[],
  outputs: {
    address: string,
    amount: BigAmount
  }[],
  fee?: BigAmount
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const utxo = accounts.selectors.getUtxo(state, ownProps.entryId);
    const parsed = bitcoin.Transaction.fromHex(ownProps.rawtx);
    const amountParse = amountDecoder(ownProps.blockchain);
    const amountF = amountFactory(ownProps.blockchain);

    const inputs = parsed.ins.map((it) => {
      const txid = it.hash.reverse().toString('hex');
      const current = utxo.find((t) => t.txid == txid && t.vout == it.index);
      if (!current) {
        console.error("Unknown input", txid);
      }
      return {
        txid,
        vout: it.index,
        address: current?.address,
        amount: current ? amountParse(current.value) : amountF(0)
      }
    });
    const outputs = parsed.outs.map((it) => {
      return {
        address: bitcoin.address.fromOutputScript(it.script),
        amount: amountF(it.value)
      }
    });
    const sent = inputs
      .map((it) => it.amount)
      .reduce((a, b) => a.plus(b), amountF(0));
    const receive = outputs
      .map((it) => it.amount)
      .reduce((a, b) => a.plus(b), amountF(0));

    const knownInputs = inputs.every((it) => typeof it.address === "string")

    return {
      parsed: {
        inputs,
        outputs,
        fee: knownInputs ? sent.minus(receive) : undefined
      }
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));