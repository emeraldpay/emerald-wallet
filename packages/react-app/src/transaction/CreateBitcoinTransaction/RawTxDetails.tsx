import { BigAmount } from '@emeraldpay/bigamount';
import { EntryId } from '@emeraldpay/emerald-vault-core/lib/types';
import { BlockchainCode, amountDecoder, amountFactory } from '@emeraldwallet/core';
import { IState, accounts } from '@emeraldwallet/store';
import { Address, TxRef } from '@emeraldwallet/ui';
import { Box, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import * as bitcoin from 'bitcoinjs-lib';
import classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import FormField from '../../form/FormField';
import FormLabel from '../../form/FormLabel';

const useStyles = makeStyles(
  createStyles({
    inputField: {
      flexGrow: 5,
    },
  }),
);

type Parsed = {
  inputs: {
    txid: string;
    vout: number;
    address?: string;
    amount: BigAmount;
  }[];
  outputs: {
    address: string;
    amount: BigAmount;
  }[];
  fee?: BigAmount;
};

interface OwnProps {
  blockchain: BlockchainCode;
  entryId: EntryId;
  rawTx: string;
}

interface StateProps {
  parsed: Parsed;
}

const RawTxDetails: React.FC<OwnProps & StateProps> = ({ parsed }) => {
  const styles = useStyles();
  return (
    <Box>
      <FormField>
        <FormLabel>From</FormLabel>
        <Box className={classNames(styles.inputField)}>
          {parsed.inputs.map((input) => (
            <Box key={input.address}>
              {input.address && <Address address={input.address} />}
              {typeof input.address == 'undefined' && <TxRef txid={input.txid} vout={input.vout} />}
              {!input.amount.isZero() && <Typography>{input.amount.toString()}</Typography>}
            </Box>
          ))}
        </Box>
      </FormField>
      <FormField>
        <FormLabel>To</FormLabel>
        <Box className={classNames(styles.inputField)}>
          {parsed.outputs.map((output) => (
            <Box key={output.address}>
              <Address address={output.address} />
              <Typography>{output.amount.toString()}</Typography>
            </Box>
          ))}
        </Box>
      </FormField>
      <FormField>
        <FormLabel>Fee</FormLabel>
        <Box className={classNames(styles.inputField)}>
          {parsed.fee ? (
            <Typography>{parsed.fee.toString()}</Typography>
          ) : (
            <Alert severity={'warning'} color={'warning'}>
              Unknown Fee. May be invalid.
            </Alert>
          )}
        </Box>
      </FormField>
    </Box>
  );
};

export default connect<StateProps, unknown, OwnProps, IState>((state, ownProps) => {
  const utxo = accounts.selectors.getUtxo(state, ownProps.entryId);
  const parsed = bitcoin.Transaction.fromHex(ownProps.rawTx);
  const amountParse = amountDecoder(ownProps.blockchain);
  const amountF = amountFactory(ownProps.blockchain);
  let network: bitcoin.Network;
  if (ownProps.blockchain == BlockchainCode.TestBTC) {
    network = bitcoin.networks.testnet;
  } else {
    network = bitcoin.networks.bitcoin;
  }

  const inputs = parsed.ins.map((it) => {
    const txid = it.hash.reverse().toString('hex');
    const current = utxo.find((t) => t.txid == txid && t.vout == it.index);
    if (!current) {
      console.error('Unknown input', txid);
    }
    return {
      txid,
      vout: it.index,
      address: current?.address,
      amount: current ? amountParse(current.value) : amountF(0),
    };
  });
  const outputs = parsed.outs.map((it) => {
    return {
      address: bitcoin.address.fromOutputScript(it.script, network),
      amount: amountF(it.value),
    };
  });
  const sent = inputs.map((it) => it.amount).reduce((a, b) => a.plus(b), amountF(0));
  const receive = outputs.map((it) => it.amount).reduce((a, b) => a.plus(b), amountF(0));

  const knownInputs = inputs.every((it) => typeof it.address === 'string');

  return {
    parsed: {
      inputs,
      outputs,
      fee: knownInputs ? sent.minus(receive) : undefined,
    },
  };
})(RawTxDetails);
