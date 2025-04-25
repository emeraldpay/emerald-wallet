import { workflow } from '@emeraldwallet/core';
import { FormAccordion, FormLabel, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import { SatoshiAny } from '@emeraldpay/bigamount-crypto';
import { FormatterBuilder } from '@emeraldpay/bigamount';
import { SettingFee } from './SettingFee';
import { SettingSource } from './SettingSource';

const useStyles = makeStyles()({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
    inputField: {
      flexGrow: 5,
    },
  }
);

interface OwnProps {
  createTx: workflow.CreateBitcoinTx;
  feeRange: workflow.BitcoinFeeRange;
  initializing?: boolean;
  setTransaction(transaction: workflow.BitcoinPlainTx): void;
}

function settingsSummary(fees: SatoshiAny): string {
  const feeFormatter = new FormatterBuilder()
    .useOptimalUnit(undefined, [fees.units.top, fees.units.base], 3)
    .number(3, true)
    .append(" ")
    .unitCode()
    .build();
  let buffer = "";
  buffer += feeFormatter.format(fees);
  buffer += " (fees)";
  return buffer;
}

export const SettingsPanel: React.FC<OwnProps> = ({ createTx, feeRange, initializing = false, setTransaction }) => {
  const styles = useStyles().classes;

  return (
    <FormAccordion
      title={
        <FormRow last>
          <FormLabel>Settings</FormLabel>
          {settingsSummary(createTx.getFees())}
        </FormRow>
      }
    >
      <FormRow>
        <FormLabel top>Fee</FormLabel>
        <SettingFee
            className={styles.inputField}
            createTx={createTx} setTransaction={setTransaction}
            feeRange={feeRange} initializing={initializing} />
      </FormRow>
      <FormRow>
        <FormLabel top>Source Address</FormLabel>
        <SettingSource createTx={createTx} setTransaction={setTransaction} />
      </FormRow>
    </FormAccordion>
  );
};
