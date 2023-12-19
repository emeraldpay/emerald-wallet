import { workflow } from '@emeraldwallet/core';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { ToField } from '../../../../common/ToField';

interface OwnProps {
  createTx: workflow.AnyBitcoinCreateTx | workflow.AnyEtherCreateTx | workflow.AnyErc20CreateTx;
  setTransaction(transaction: workflow.AnyPlainTx): void;
}

export const To: React.FC<OwnProps> = ({ createTx, setTransaction }) => {
  const handleToChange = (to: string): void => {
    createTx.to = to;

    setTransaction(createTx.dump());
  };

  return (
    <FormRow>
      <FormLabel>To</FormLabel>
      <ToField blockchain={createTx.blockchain} to={createTx.to} onChange={handleToChange} />
    </FormRow>
  );
};
