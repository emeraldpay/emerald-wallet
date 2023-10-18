import { BigAmount } from '@emeraldpay/bigamount';
import { BitcoinEntry, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, amountDecoder, amountFactory, blockchainIdToCode } from '@emeraldwallet/core';
import { BroadcastData, IState, accounts, transaction } from '@emeraldwallet/store';
import { Address, Balance, Button, ButtonGroup, FormLabel, FormRow, TxRef } from '@emeraldwallet/ui';
import { TextField, Typography, createStyles, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as bitcoin from 'bitcoinjs-lib';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles((theme) =>
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
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
    rawTx: {
      ...theme.monotype,
      fontSize: 12,
    },
  }),
);

interface OwnProps {
  entry: BitcoinEntry;
  signed: string;
  txId: string;
  unsigned: UnsignedBitcoinTx;
  onCancel(): void;
}

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

interface StateProps {
  blockchain: BlockchainCode;
  parsed: {
    fee?: BigAmount;
    inputs: ParsedInput[];
    outputs: ParsedOutput[];
  };
}

interface DispatchProps {
  broadcastTx(data: BroadcastData): void;
}

const BroadcastTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  blockchain,
  entry,
  parsed,
  signed,
  txId,
  unsigned,
  broadcastTx,
  onCancel,
}) => {
  const styles = useStyles();

  const [showRaw, setShowRaw] = React.useState(false);

  const handleBroadcastTx = (): void => {
    const fee = amountFactory(blockchain)(unsigned.fee);

    broadcastTx({ blockchain, fee, signed, txId, entryId: entry.id, tx: unsigned });
  };

  return (
    <>
      <FormRow>
        <FormLabel top={0}>From</FormLabel>
        <div className={styles.balances}>
          {parsed.inputs.map(({ address, amount, txid, vout }) => (
            <div key={`${txid}:${vout}`} className={styles.balanceItem}>
              <div className={styles.balanceItemAddress}>
                {address == null ? <TxRef txid={txid} vout={vout} /> : <Address address={address} />}
              </div>
              <Balance balance={amount} />
            </div>
          ))}
        </div>
      </FormRow>
      <FormRow>
        <FormLabel top={0}>To</FormLabel>
        <div className={styles.balances}>
          {parsed.outputs.map(({ address, amount }, index) => (
            <div key={`${address}-${index}`} className={styles.balanceItem}>
              <div className={styles.balanceItemAddress}>
                <Address address={address} />
              </div>
              <Balance balance={amount} />
            </div>
          ))}
        </div>
      </FormRow>
      <FormRow>
        <FormLabel>Fee</FormLabel>
        {parsed.fee == null ? (
          <Alert severity="warning">Unknown Fee. May be invalid.</Alert>
        ) : (
          <Typography>{parsed.fee.toString()}</Typography>
        )}
      </FormRow>
      {showRaw ? (
        <>
          <FormRow>
            <FormLabel top>Raw Tx</FormLabel>
            <TextField
              fullWidth
              multiline
              disabled
              minRows={4}
              value={signed}
              InputProps={{
                classes: {
                  input: styles.rawTx,
                },
              }}
            />
          </FormRow>
          <FormRow>
            <FormLabel />
            <Button label="Hide Raw" variant="outlined" onClick={() => setShowRaw(false)} />
          </FormRow>
        </>
      ) : (
        <FormRow>
          <FormLabel>Raw Tx</FormLabel>
          <Button label="Show Raw" variant="outlined" onClick={() => setShowRaw(true)} />
        </FormRow>
      )}
      <FormRow last>
        <ButtonGroup classes={{ container: styles.buttons }}>
          <Button label="Cancel" onClick={onCancel} />
          <Button primary label="Send" onClick={handleBroadcastTx} />
        </ButtonGroup>
      </FormRow>
    </>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { entry, signed }) => {
    const blockchain = blockchainIdToCode(entry.blockchain);
    const network = blockchain === BlockchainCode.TestBTC ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;

    const factory = amountFactory(blockchain);
    const decoder = amountDecoder(blockchain);

    const tx = bitcoin.Transaction.fromHex(signed);
    const utxo = accounts.selectors.getUtxo(state, entry.id);

    const inputs = tx.ins.map(({ index, hash }) => {
      const txId = hash.reverse().toString('hex');
      const balance = utxo.find(({ txid, vout }) => txid === txId && vout === index);

      return {
        address: balance?.address,
        amount: balance ? decoder(balance.value) : factory(0),
        txid: txId,
        vout: index,
      };
    });

    const outputs = tx.outs.map(({ script, value }) => ({
      address: bitcoin.address.fromOutputScript(script, network),
      amount: factory(value),
    }));

    const sent = inputs.map((input) => input.amount).reduce((carry, amount) => carry.plus(amount), factory(0));
    const receive = outputs.map((output) => output.amount).reduce((carry, amount) => carry.plus(amount), factory(0));

    return {
      blockchain,
      parsed: {
        inputs,
        outputs,
        fee: inputs.every(({ address }) => address != null) ? sent.minus(receive) : undefined,
      },
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    broadcastTx(data) {
      dispatch(transaction.actions.broadcastTx(data));
    },
  }),
)(BroadcastTransaction);
