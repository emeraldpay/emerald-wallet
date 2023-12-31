import { workflow } from '@emeraldwallet/core';
import { Button, FormLabel, FormRow } from '@emeraldwallet/ui';
import { IconButton, Tooltip, createStyles, makeStyles } from '@material-ui/core';
import { AllInclusive as InfiniteIcon } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { NumberField } from '../../../../common/NumberField';

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

  const maxAmountUnits = React.useRef(createTx.amount.units);

  const [allowInfinite, setAllowInfinite] = React.useState(createTx.target === workflow.ApproveTarget.INFINITE);
  const [maxAmount, setMaxAmount] = React.useState<BigNumber | undefined>();

  const handleInfiniteClick = (): void => {
    const allowed = !allowInfinite;

    setAllowInfinite(allowed);

    createTx.target = allowed ? workflow.ApproveTarget.INFINITE : workflow.ApproveTarget.MAX_AVAILABLE;

    setTransaction(createTx.dump());
  };

  const handleAmountChange = (amount: BigNumber): void => {
    createTx.amount = amount;

    setTransaction(createTx.dump());
  };

  const handleMaxAmountClick = (): void => {
    createTx.target = workflow.ApproveTarget.MAX_AVAILABLE;

    setTransaction(createTx.dump());

    setMaxAmount(createTx.amount.getNumberByUnit(createTx.amount.units.top));
  };

  React.useEffect(() => {
    const { units } = createTx.amount;

    if (createTx.target === workflow.ApproveTarget.MAX_AVAILABLE && !units.equals(maxAmountUnits.current)) {
      maxAmountUnits.current = units;

      setMaxAmount(createTx.amount.getNumberByUnit(units.top));
    }
  }, [createTx]);

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
            <NumberField
              decimals={createTx.token.decimals}
              initialValue={createTx.amount.getNumberByUnit(createTx.amount.units.top)}
              rightIcon={
                <Button
                  label="Max"
                  primary={createTx.target === workflow.ApproveTarget.MAX_AVAILABLE}
                  size="small"
                  variant="text"
                  onClick={handleMaxAmountClick}
                />
              }
              value={maxAmount}
              onChange={handleAmountChange}
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
