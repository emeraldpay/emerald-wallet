import { workflow } from '@emeraldwallet/core';
import { FormAccordion, FormLabel, FormRow } from '@emeraldwallet/ui';
import { Box, FormControlLabel, FormHelperText, Slider, Switch } from '@mui/material';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import { SatoshiAny } from '@emeraldpay/bigamount-crypto';
import { BigAmountFormatter, FormatterBuilder } from '@emeraldpay/bigamount';

const useStyles = makeStyles()({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
    feeHelp: {
      paddingLeft: 10,
      position: 'initial',
    },
    feeHelpBox: {
      width: 500,
      clear: 'left',
    },
    feeMarkLabel: {
      fontSize: '0.7em',
      opacity: 0.8,
    },
    feeSlider: {
      marginBottom: 10,
      paddingTop: 10,
      width: 300,
    },
    feeSliderBox: {
      float: 'left',
      width: 300,
    },
    feeTypeBox: {
      float: 'left',
      height: 40,
      width: 200,
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
  setTransaction(transaction: workflow.AnyPlainTx): void;
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

  const [useStdFee, setUseStdFee] = React.useState(true);

  const handleFeePriceChange = (event: Event, value: number | number[], activeThumb: number): void => {
    const [feePrice] = Array.isArray(value) ? value : [value];

    createTx.feePrice = feePrice;

    setTransaction(createTx.dump());
  };

  const handleUseStdFeePrice = (event: React.ChangeEvent, checked: boolean): void => {
    setUseStdFee(checked);

    if (checked) {
      createTx.feePrice = feeRange.std;

      setTransaction(createTx.dump());
    }
  };

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
        <Box className={styles.inputField}>
          <Box className={styles.feeTypeBox}>
            <FormControlLabel
              control={
                <Switch checked={useStdFee} disabled={initializing} onChange={handleUseStdFeePrice} color="primary" />
              }
              label={useStdFee ? 'Standard Fee' : 'Custom Fee'}
            />
          </Box>
          {!useStdFee && (
            <Box className={styles.feeSliderBox}>
              <Slider
                className={styles.feeSlider}
                classes={{ markLabel: styles.feeMarkLabel }}
                marks={[
                  { value: feeRange.min, label: 'Slow' },
                  { value: feeRange.max, label: 'Urgent' },
                ]}
                min={feeRange.min}
                max={feeRange.max}
                step={1}
                value={createTx.vkbPrice}
                valueLabelDisplay="auto"
                onChange={handleFeePriceChange}
                valueLabelFormat={(value) => (value / 1024).toFixed(2)}
              />
            </Box>
          )}
          <Box className={styles.feeHelpBox}>
            <FormHelperText className={styles.feeHelp}>{createTx.getFees().toString()} (per KB)</FormHelperText>
          </Box>
        </Box>
      </FormRow>
    </FormAccordion>
  );
};
