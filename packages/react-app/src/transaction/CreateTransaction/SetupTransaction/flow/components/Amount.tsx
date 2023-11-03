import { Blockchains, workflow } from '@emeraldwallet/core';
import { Button, FormLabel, FormRow } from '@emeraldwallet/ui';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { NumberField } from '../../../../../common/NumberField';

interface OwnProps {
  createTx: workflow.AnyCreateTx;
  maxDisabled: boolean;
  setTransaction(transaction: workflow.AnyPlainTx): void;
}

export const Amount: React.FC<OwnProps> = ({ createTx, maxDisabled, setTransaction }) => {
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

    setMaxAmount(createTx.amount.getNumberByUnit(createTx.amount.units.top));
  };

  const { decimals } = Blockchains[createTx.blockchain].params;

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
