import { BigAmount } from '@emeraldpay/bigamount';
import { EntryId } from '@emeraldpay/emerald-vault-core/lib/types';
import { BlockchainCode, amountDecoder, amountFactory } from '@emeraldwallet/core';
import { IState, accounts } from '@emeraldwallet/store';
import { Address, Balance, FormLabel, FormRow, TxRef } from '@emeraldwallet/ui';
import { Typography, createStyles, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as bitcoin from 'bitcoinjs-lib';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles(
  createStyles({
    balances: {
      width: '100%',
    },
    balanceItem: {
      display: 'flex',
      '& + &': {
        marginTop: 20,
      },
    },
    balanceItemAddress: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
    },
  }),
);

interface ParsedInput {
  address?: string;
  amount: BigAmount;
  txid: string;
  vout: number;
}

interface ParsedOutput {
  address: string;
  amount: BigAmount;
}

interface Parsed {
  fee?: BigAmount;
  inputs: ParsedInput[];
  outputs: ParsedOutput[];
}

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
    <>
      <FormRow>
        <FormLabel top={0}>From</FormLabel>
        <div className={styles.balances}>
          {parsed.inputs.map((input) => (
            <div key={`${input.txid}:${input.vout}`} className={styles.balanceItem}>
              <div className={styles.balanceItemAddress}>
                {input.address == null ? (
                  <TxRef txid={input.txid} vout={input.vout} />
                ) : (
                  <Address address={input.address} />
                )}
              </div>
              <Balance balance={input.amount} />
            </div>
          ))}
        </div>
      </FormRow>
      <FormRow>
        <FormLabel top={0}>To</FormLabel>
        <div className={styles.balances}>
          {parsed.outputs.map((output, index) => (
            <div key={`${output.address}-${index}`} className={styles.balanceItem}>
              <div className={styles.balanceItemAddress}>
                <Address address={output.address} />
              </div>
              <Balance balance={output.amount} />
            </div>
          ))}
        </div>
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
  const factory = amountFactory(blockchain);
  const decoder = amountDecoder(blockchain);

  const network = blockchain === BlockchainCode.TestBTC ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

  const tx = bitcoin.Transaction.fromHex(rawTx);
  const utxo = accounts.selectors.getUtxo(state, entryId);

  const inputs = tx.ins.map((input) => {
    const txId = input.hash.reverse().toString('hex');
    const balance = utxo.find((item) => item.txid == txId && item.vout == input.index);

    return {
      address: balance?.address,
      amount: balance ? decoder(balance.value) : factory(0),
      txid: txId,
      vout: input.index,
    };
  });

  const outputs = tx.outs.map((output) => ({
    address: bitcoin.address.fromOutputScript(output.script, network),
    amount: factory(output.value),
  }));

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
