import { EntryId } from '@emeraldpay/emerald-vault-core';
import { BitcoinRawTransaction, amountFactory, blockchainIdToCode, formatAmount } from '@emeraldwallet/core';
import { ChangeType } from '@emeraldwallet/core/lib/persistentState';
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

const SpeedUpBitcoinTransaction: React.FC<OwnProps> = ({ entryId, isHardware, rawTx, tx, goBack }) => {
  const styles = useStyles();

  return (
    <ModifyBitcoinTransaction
      entryId={entryId}
      rawTx={rawTx}
      isHardware={isHardware}
      tx={tx}
      goBack={goBack}
      renderNotice={(tx, unsignedTx) => {
        const blockchainCode = blockchainIdToCode(tx.blockchain);

        const oldFee =
          tx.changes.find(({ type }) => type === ChangeType.FEE)?.amountValue ?? zeroAmountFor(blockchainCode);

        return (
          <FormRow>
            <FormLabel />
            <Typography>
              Accelerating transaction <span className={styles.hash}>{tx.txId}</span> with an extra{' '}
              {formatAmount(amountFactory(blockchainCode)(unsignedTx.fee).minus(oldFee))} fee for faster processing.
            </Typography>
          </FormRow>
        );
      }}
    />
  );
};

export default SpeedUpBitcoinTransaction;
