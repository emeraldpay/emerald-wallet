import { BigAmount } from '@emeraldpay/bigamount';
import { TokenAmount, workflow } from '@emeraldwallet/core';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import { IconButton, Tooltip, createStyles, makeStyles } from '@material-ui/core';
import { AllInclusive as InfiniteIcon } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { AmountField } from '../../../../../common/AmountField';

const useStyles = makeStyles((theme) =>
  createStyles({
    field: {
      alignItems: 'center',
      display: 'flex',
      minHeight: 52,
    },
    button: {
      marginRight: theme.spacing(),
    },
  }),
);

interface OwnProps {
  createTx: workflow.CreateErc20ApproveTx;
  setTransaction(transaction: workflow.AnyPlainTx): void;
}

export const ApproveAmount: React.FC<OwnProps> = ({ createTx, setTransaction }) => {
  const styles = useStyles();

  const [allowInfinite, setAllowInfinite] = React.useState(createTx.target === workflow.ApproveTarget.INFINITE);

  const handleInfiniteClick = (): void => {
    const allowed = !allowInfinite;

    setAllowInfinite(allowed);

    createTx.target = allowed ? workflow.ApproveTarget.INFINITE : workflow.ApproveTarget.MAX_AVAILABLE;

    setTransaction(createTx.dump());
  };

  const handleAmountChange = (amount: BigAmount): void => {
    createTx.amount = new TokenAmount(amount, createTx.amount.units, createTx.token);

    setTransaction(createTx.dump());
  };

  const handleMaxAmountClick = (callback: (value: BigAmount) => void): void => {
    createTx.target = workflow.ApproveTarget.MAX_AVAILABLE;

    callback(createTx.amount);

    setTransaction(createTx.dump());
  };

  return (
    <>
      <FormRow>
        <FormLabel>Amount</FormLabel>
        <div className={styles.field}>
          <Tooltip title="Unrestricted access">
            <IconButton
              className={styles.button}
              color={allowInfinite ? 'primary' : 'secondary'}
              onClick={handleInfiniteClick}
            >
              <InfiniteIcon />
            </IconButton>
          </Tooltip>
          {!allowInfinite && (
            <AmountField
              amount={createTx.amount}
              fieldWidth={380}
              maxAmount={createTx.totalTokenBalance}
              units={createTx.totalTokenBalance.units}
              onChangeAmount={handleAmountChange}
              onMaxClick={handleMaxAmountClick}
            />
          )}
        </div>
      </FormRow>
      {createTx.amount.isZero() && (
        <FormRow>
          <FormLabel />
          <Alert severity="info">
            By setting the value to &quot;0&quot;, you prohibit any token transfers by target address.
          </Alert>
        </FormRow>
      )}
      {allowInfinite && (
        <FormRow>
          <FormLabel />
          <Alert severity="warning">Unrestricted access. Grant only to trusted addresses.</Alert>
        </FormRow>
      )}
    </>
  );
};
