import { EntryId } from '@emeraldpay/emerald-vault-core';
import { BitcoinRawTransaction, amountFactory, blockchainIdToCode, formatAmount } from '@emeraldwallet/core';
import { StoredTransaction } from '@emeraldwallet/store';
import { zeroAmountFor } from '@emeraldwallet/store/lib/accounts/selectors';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import { Typography, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import ModifyBitcoinTransaction from '../ModifyBitcoinTransaction';

const useStyles = makeStyles((theme) =>
  createStyles({
    hash: {
      ...theme.monotype,
      fontWeight: 'normal',
    },
  }),
);

interface OwnProps {
  entryId: EntryId | undefined;
  isHardware: boolean;
  rawTx: BitcoinRawTransaction;
  tx: StoredTransaction;
  goBack(): void;
}

const CancelBitcoinTransaction: React.FC<OwnProps> = ({ entryId, isHardware, rawTx, tx, goBack }) => {
  const styles = useStyles();

  return (
    <ModifyBitcoinTransaction
      entryId={entryId}
      rawTx={rawTx}
      isCancel={true}
      isHardware={isHardware}
      tx={tx}
      goBack={goBack}
      renderNotice={(tx, unsignedTx) => {
        const blockchainCode = blockchainIdToCode(tx.blockchain);

        const factory = amountFactory(blockchainCode);

        const amount = unsignedTx.outputs.reduce(
          (carry, { amount }) => carry.plus(factory(amount)),
          zeroAmountFor(blockchainCode),
        );

        return (
          <FormRow>
            <FormLabel />
            <Typography>
              Reverting transaction <span className={styles.hash}>{tx.txId}</span> and returning back{' '}
              {formatAmount(amount)}. With {formatAmount(factory(unsignedTx.fee))} fee applied for reversal.
            </Typography>
          </FormRow>
        );
      }}
    />
  );
};

export default CancelBitcoinTransaction;
