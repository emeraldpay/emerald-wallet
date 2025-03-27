import { BlockchainCode, InputUtxo, amountDecoder, amountFactory } from '@emeraldwallet/core';
import { Address, Balance, FormLabel, FormRow, TxRef } from '@emeraldwallet/ui';
import { Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { Alert } from '@mui/lab';
import { Transaction, address, networks } from 'bitcoinjs-lib';
import * as React from 'react';

const useStyles = makeStyles()(() => ({
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
}));

interface OwnProps {
  blockchain: BlockchainCode;
  raw: string;
  utxo: InputUtxo[];
}

export const BitcoinDecoded: React.FC<OwnProps> = ({ blockchain, raw, utxo }) => {
  const { classes } = useStyles();

  const decoded = React.useMemo(() => {
    const factory = amountFactory(blockchain);
    const decoder = amountDecoder(blockchain);

    const zeroAmount = factory(0);

    const tx = Transaction.fromHex(raw);

    const inputs = tx.ins.map(({ index, hash }) => {
      const txId = hash.reverse().toString('hex');
      const balance = utxo.find(({ txid, vout }) => txid === txId && vout === index);

      return {
        address: balance?.address,
        amount: balance ? decoder(balance.value) : zeroAmount,
        txid: txId,
        vout: index,
      };
    });

    const network = blockchain === BlockchainCode.TestBTC ? networks.testnet : networks.bitcoin;

    const outputs = tx.outs.map(({ script, value }) => ({
      address: address.fromOutputScript(script, network),
      amount: factory(value),
    }));

    const sent = inputs.map((input) => input.amount).reduce((carry, amount) => carry.plus(amount), zeroAmount);
    const receive = outputs.map((output) => output.amount).reduce((carry, amount) => carry.plus(amount), zeroAmount);

    return {
      inputs,
      outputs,
      fee: inputs.every(({ address }) => address != null) ? sent.minus(receive) : undefined,
    };
  }, [blockchain, raw, utxo]);

  return (
    <>
      <FormRow>
        <FormLabel top={0}>From</FormLabel>
        <div className={classes.balances}>
          {decoded.inputs.map(({ address, amount, txid, vout }) => (
            <div key={`${txid}:${vout}`} className={classes.balanceItem}>
              <div className={classes.balanceItemAddress}>
                {address == null ? <TxRef txid={txid} vout={vout} /> : <Address address={address} />}
              </div>
              <Balance balance={amount} />
            </div>
          ))}
        </div>
      </FormRow>
      <FormRow>
        <FormLabel top={0}>To</FormLabel>
        <div className={classes.balances}>
          {decoded.outputs.map(({ address, amount }, index) => (
            <div key={`${address}-${index}`} className={classes.balanceItem}>
              <div className={classes.balanceItemAddress}>
                <Address address={address} />
              </div>
              <Balance balance={amount} />
            </div>
          ))}
        </div>
      </FormRow>
      <FormRow>
        <FormLabel>Fee</FormLabel>
        {decoded.fee == null ? (
          <Alert severity="warning">Unknown Fee. May be invalid.</Alert>
        ) : (
          <Typography>{decoded.fee.toString()}</Typography>
        )}
      </FormRow>
    </>
  );
};
