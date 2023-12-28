import { Blockchains, TokenAmount, workflow } from '@emeraldwallet/core';
import { Button, FormLabel, FormRow } from '@emeraldwallet/ui';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { NumberField } from '../../../../common/NumberField';

interface OwnProps {
  createTx: workflow.AnyCreateTx;
  maxDisabled: boolean;
  setTransaction(transaction: workflow.AnyPlainTx): void;
}

export const Amount: React.FC<OwnProps> = ({ createTx, maxDisabled, setTransaction }) => {
  const maxAmountUnits = React.useRef(createTx.amount.units);

  const [maxAmount, setMaxAmount] = React.useState<BigNumber | undefined>();

  const handleAmountChange = (amount: BigNumber): void => {
    createTx.target = workflow.TxTarget.MANUAL;
    createTx.setAmount(amount);

    setTransaction(createTx.dump());
  };

  const handleMaxAmountClick = (): void => {
    createTx.target = workflow.TxTarget.SEND_ALL;
    createTx.rebalance();

    setTransaction(createTx.dump());

    const { amount } = createTx;

    setMaxAmount(amount.getNumberByUnit(amount.units.top));
  };

  React.useEffect(() => {
    const { units } = createTx.amount;

    if (createTx.target === workflow.TxTarget.SEND_ALL && !units.equals(maxAmountUnits.current)) {
      maxAmountUnits.current = units;

      setMaxAmount(createTx.amount.getNumberByUnit(units.top));
    }
  }, [createTx]);

  let decimals: number;

  if (TokenAmount.is(createTx.amount)) {
    ({ decimals } = createTx.amount.token);
  } else {
    ({ decimals } = Blockchains[createTx.blockchain].params);
  }

  return (
    <FormRow>
      <FormLabel>Amount</FormLabel>
      <NumberField
        decimals={decimals}
        initialValue={createTx.amount.getNumberByUnit(createTx.amount.units.top)}
        rightIcon={
          <Button
            disabled={maxDisabled}
            label="Max"
            primary={createTx.target === workflow.TxTarget.SEND_ALL}
            size="small"
            variant="text"
            onClick={handleMaxAmountClick}
          />
        }
        value={maxAmount}
        onChange={handleAmountChange}
      />
    </FormRow>
  );
};
