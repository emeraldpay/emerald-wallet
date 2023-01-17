import { BigAmount } from '@emeraldpay/bigamount';
import { EntryId } from '@emeraldpay/emerald-vault-core/lib/types';
import { BlockchainCode, amountDecoder, amountFactory } from '@emeraldwallet/core';
import { IState, accounts } from '@emeraldwallet/store';
import { Address, FormLabel, FormRow, TxRef } from '@emeraldwallet/ui';
import { Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as bitcoin from 'bitcoinjs-lib';
import * as React from 'react';
import { connect } from 'react-redux';

type Parsed = {
  fee?: BigAmount;
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
  return (
    <>
      <FormRow>
        <FormLabel top>From</FormLabel>
        {parsed.inputs.map((input) => (
          <div key={input.address}>
            {input.address && <Address address={input.address} />}
            {typeof input.address == 'undefined' && <TxRef txid={input.txid} vout={input.vout} />}
            {!input.amount.isZero() && <Typography>{input.amount.toString()}</Typography>}
          </div>
        ))}
      </FormRow>
      <FormRow>
        <FormLabel top>To</FormLabel>
        {parsed.outputs.map((output) => (
          <div key={output.address}>
            <Address address={output.address} />
            <Typography>{output.amount.toString()}</Typography>
          </div>
        ))}
      </FormRow>
      <FormRow>
        <FormLabel>Fee</FormLabel>
        {parsed.fee ? (
          <Typography>{parsed.fee.toString()}</Typography>
        ) : (
          <Alert severity={'warning'} color={'warning'}>
            Unknown Fee. May be invalid.
          </Alert>
        )}
      </FormRow>
    </>
  );
};

export default connect<StateProps, unknown, OwnProps, IState>((state, { blockchain, entryId, rawTx }) => {
  const decoder = amountDecoder(blockchain);
  const factory = amountFactory(blockchain);

  const network = blockchain === BlockchainCode.TestBTC ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

  const tx = bitcoin.Transaction.fromHex(rawTx);
  const utxo = accounts.selectors.getUtxo(state, entryId);

  const inputs = tx.ins.map((input) => {
    const txId = input.hash.reverse().toString('hex');
    const balance = utxo.find((t) => t.txid == txId && t.vout == input.index);

    return {
      address: balance?.address,
      amount: balance ? decoder(balance.value) : factory(0),
      txid: txId,
      vout: input.index,
    };
  });

  const outputs = tx.outs.map((it) => (
    {
      address: bitcoin.address.fromOutputScript(it.script, network),
      amount: factory(it.value),
    }
  ));

  const sent = inputs.map((input) => input.amount).reduce((carry, amount) => carry.plus(amount), factory(0));
  const receive = outputs.map((output) => output.amount).reduce((carry, amount) => carry.plus(amount), factory(0));

  const knownInputs = inputs.every((input) => input.address != null);

  return {
    parsed: {
      inputs,
      outputs,
      fee: knownInputs ? sent.minus(receive) : undefined,
    },
  };
})(RawTxDetails);
