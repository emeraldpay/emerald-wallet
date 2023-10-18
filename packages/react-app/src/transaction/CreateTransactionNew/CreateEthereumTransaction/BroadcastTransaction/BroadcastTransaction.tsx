import { BigAmount } from '@emeraldpay/bigamount';
import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  Blockchains,
  DecodedInput,
  EthereumTx,
  MAX_DISPLAY_ALLOWANCE,
  TokenRegistry,
  amountFactory,
  decodeData,
  formatAmountPartial,
  toNumber,
  workflow,
} from '@emeraldwallet/core';
import { IState, Signed, transaction, txStash } from '@emeraldwallet/store';
import { Account, Button, ButtonGroup, FormLabel, FormRow } from '@emeraldwallet/ui';
import { TextField, Tooltip, Typography, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';

export const useStyles = makeStyles(
  createStyles({
    amount: {
      display: 'inline-block',
      maxWidth: 120,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      verticalAlign: 'bottom',
    },
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
    tooltip: {
      cursor: 'help',
    },
  }),
);

interface OwnProps {
  entry: EthereumEntry;
  onCancel(): void;
}

interface StateProps {
  createTx: workflow.CreateTx;
  signed: Signed;
  tokenRegistry: TokenRegistry;
}

interface DispatchProps {
  onSend(createTx: workflow.CreateTx, signed: Signed): void;
}

const BroadcastTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  createTx,
  signed,
  tokenRegistry,
  onCancel,
  onSend,
}) => {
  const styles = useStyles();

  const decoded = React.useMemo(() => {
    const { chainId, code: blockchain } = Blockchains[createTx.blockchain].params;

    const tx = EthereumTx.fromRaw(signed.raw, chainId);

    const data = tx.getData();
    const from = tx.getSenderAddress().toString();
    const nonce = tx.getNonce();

    let amount: BigAmount = amountFactory(createTx.blockchain)(toNumber(tx.getValue()));
    let to = tx.getRecipientAddress().toString();

    let owner: string | undefined;
    let method: string | undefined;

    if (data.length > 0) {
      const decodedData = decodeData(data);

      method = decodedData.name;

      if (decodedData.inputs.length > 1 && tokenRegistry.hasAddress(blockchain, to)) {
        let dataFrom: DecodedInput | undefined;
        let dataTo: DecodedInput | undefined;
        let dataAmount: DecodedInput | undefined;

        switch (method) {
          case 'approve':
          case 'transfer': {
            [dataTo, dataAmount] = decodedData.inputs;

            break;
          }
          case 'transferFrom': {
            [dataFrom, dataTo, dataAmount] = decodedData.inputs;
          }
        }

        if (dataTo != null && dataAmount != null) {
          const tokenData = tokenRegistry.byAddress(blockchain, to);

          amount = tokenData.getAmount(dataAmount);
          owner = dataFrom?.toString(16);
          to = dataTo.toString(16);
        }
      }
    }

    return { amount, from, method, nonce, owner, to };
  }, [createTx.blockchain, signed.raw, tokenRegistry]);

  const [amountValue, amountUnit] = formatAmountPartial(decoded.amount);

  return (
    <>
      <FormRow>
        <FormLabel>From</FormLabel>
        <Account identity={true} address={decoded.from} />
      </FormRow>
      {decoded.owner != null && (
        <FormRow>
          <FormLabel>Owner</FormLabel>
          <Account identity={true} address={decoded.owner} />
        </FormRow>
      )}
      <FormRow>
        <FormLabel>To</FormLabel>
        <Account identity={true} address={decoded.to} />
      </FormRow>
      {decoded.method === 'approve' ? (
        <FormRow>
          <FormLabel>Approving</FormLabel>
          <Typography>
            <Tooltip className={styles.tooltip} title={decoded.amount.toString()}>
              {decoded.amount.number.isGreaterThanOrEqualTo(MAX_DISPLAY_ALLOWANCE) ? (
                <span>&infin;</span>
              ) : (
                <span className={styles.amount}>{amountValue}</span>
              )}
            </Tooltip>{' '}
            {amountUnit}
          </Typography>
        </FormRow>
      ) : (
        <FormRow>
          <FormLabel>Amount</FormLabel>
          <Typography>
            {amountValue} {amountUnit}
          </Typography>
        </FormRow>
      )}
      <FormRow>
        <FormLabel>Nonce</FormLabel>
        <Typography>{decoded.nonce}</Typography>
      </FormRow>
      <FormRow>
        <FormLabel top>Raw Tx</FormLabel>
        <TextField disabled fullWidth multiline maxRows={7} minRows={7} value={signed.raw} />
      </FormRow>
      <FormRow last>
        <ButtonGroup classes={{ container: styles.buttons }}>
          <Button label="Cancel" onClick={onCancel} />
          <Button primary label="Send" onClick={() => onSend(createTx, signed)} />
        </ButtonGroup>
      </FormRow>
    </>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => {
    const signed = txStash.selectors.getSigned(state);

    if (signed == null) {
      throw new Error('Signed transaction not provided!');
    }

    const transaction = txStash.selectors.getTransaction(state);

    if (transaction == null) {
      throw new Error('Transaction not provided!');
    }

    const tokenRegistry = new TokenRegistry(state.application.tokens);

    return {
      signed,
      tokenRegistry,
      createTx: workflow.CreateTxConverter.fromPlain(transaction, tokenRegistry),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { entry }) => ({
    onSend(createTx, { txId, raw: signed }) {
      dispatch(
        transaction.actions.broadcastTx({
          signed,
          txId,
          blockchain: createTx.blockchain,
          entryId: entry.id,
          fee: createTx.getFees(),
          originalAmount: createTx.amount,
          tx: createTx.build(),
        }),
      );
    },
  }),
)(BroadcastTransaction);
