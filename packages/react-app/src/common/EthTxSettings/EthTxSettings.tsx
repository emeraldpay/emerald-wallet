import { Unit } from '@emeraldpay/bigamount';
import { FormAccordion, FormLabel, FormRow } from '@emeraldwallet/ui';
import { Box, FormControlLabel, FormHelperText, Slider, Switch, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles(
  createStyles({
    gasPriceHelp: {
      position: 'initial',
      paddingLeft: 10,
    },
    gasPriceHelpBox: {
      width: 500,
      clear: 'left',
    },
    gasPriceMarkLabel: {
      fontSize: '0.7em',
      opacity: 0.8,
    },
    gasPriceSlider: {
      width: 300,
      marginBottom: 10,
      paddingTop: 10,
    },
    gasPriceSliderBox: {
      width: 300,
      float: 'left',
    },
    gasPriceTypeBox: {
      width: 240,
      float: 'left',
      height: 40,
    },
    gasPriceValueLabel: {
      fontSize: '0.7em',
    },
    inputField: {
      flexGrow: 5,
    },
  }),
);

interface OwnProps {
  initializing: boolean;
  supportEip1559: boolean;
  useEip1559: boolean;
  gasPriceUnit: Unit;
  maxGasPrice: number;
  stdMaxGasPrice: number;
  lowMaxGasPrice: number;
  highMaxGasPrice: number;
  priorityGasPrice: number;
  stdPriorityGasPrice: number;
  lowPriorityGasPrice: number;
  highPriorityGasPrice: number;
  onUse1559Change(value: boolean): void;
  onMaxGasPriceChange(value: number): void;
  onPriorityGasPriceChange(value: number): void;
}

const EthTxSettings: React.FC<OwnProps> = ({
  initializing,
  supportEip1559,
  useEip1559,
  gasPriceUnit,
  maxGasPrice,
  stdMaxGasPrice,
  lowMaxGasPrice,
  highMaxGasPrice,
  priorityGasPrice,
  stdPriorityGasPrice,
  lowPriorityGasPrice,
  highPriorityGasPrice,
  onUse1559Change,
  onMaxGasPriceChange,
  onPriorityGasPriceChange,
}) => {
  const styles = useStyles();

  const [currentUseStdMaxGasPrice, setCurrentUseStdMaxGasPrice] = React.useState(true);
  const [currentUseStdPriorityGasPrice, setCurrentUseStdPriorityGasPrice] = React.useState(true);

  const onCurrentUse1559Change = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    onUse1559Change(checked);
  };

  const onUseStdMaxGasPriceChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    setCurrentUseStdMaxGasPrice(checked);

    if (checked) {
      onMaxGasPriceChange(stdMaxGasPrice);
    }
  };

  const onCurrentMaxGasPriceChange = (event: React.ChangeEvent<unknown>, value: number | number[]): void => {
    const [gasPrice] = Array.isArray(value) ? value : [value];

    onMaxGasPriceChange(gasPrice);
  };

  const onUseStdPriorityGasPriceChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    setCurrentUseStdPriorityGasPrice(checked);

    if (checked) {
      onPriorityGasPriceChange(stdPriorityGasPrice);
    }
  };

  const onCurrentPriorityGasPriceChange = (event: React.ChangeEvent<unknown>, value: number | number[]): void => {
    const [gasPrice] = Array.isArray(value) ? value : [value];

    onPriorityGasPriceChange(gasPrice);
  };

  return (
    <FormAccordion
      title={
        <FormRow last>
          <FormLabel>Settings</FormLabel>
          {useEip1559 ? 'EIP-1559' : 'Basic Type'} / {maxGasPrice.toFixed(2)} {gasPriceUnit.toString()}
          {useEip1559 ? ' Max Gas Price' : ' Gas Price'}
          {useEip1559 ? ` / ${priorityGasPrice.toFixed(2)} ${gasPriceUnit.toString()} Priority Gas Price` : null}
        </FormRow>
      }
    >
      {supportEip1559 && (
        <FormRow>
          <FormLabel>Use EIP-1559</FormLabel>
          <FormControlLabel
            control={
              <Switch checked={useEip1559} color="primary" disabled={initializing} onChange={onCurrentUse1559Change} />
            }
            label={useEip1559 ? 'Enabled' : 'Disabled'}
          />
        </FormRow>
      )}
      <FormRow>
        <FormLabel top>{useEip1559 ? 'Max gas price' : 'Gas price'}</FormLabel>
        <Box className={styles.inputField}>
          <Box className={styles.gasPriceTypeBox}>
            <FormControlLabel
              control={
                <Switch
                  checked={currentUseStdMaxGasPrice}
                  disabled={initializing}
                  onChange={onUseStdMaxGasPriceChange}
                  color="primary"
                />
              }
              label={currentUseStdMaxGasPrice ? 'Standard Price' : 'Custom Price'}
            />
          </Box>
          {!currentUseStdMaxGasPrice && (
            <Box className={styles.gasPriceSliderBox}>
              <Slider
                className={styles.gasPriceSlider}
                classes={{
                  markLabel: styles.gasPriceMarkLabel,
                  valueLabel: styles.gasPriceValueLabel,
                }}
                getAriaValueText={() => `${maxGasPrice.toFixed(2)} ${gasPriceUnit.toString()}`}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={0.01}
                marks={[
                  { value: lowMaxGasPrice, label: 'Slow' },
                  { value: highMaxGasPrice, label: 'Urgent' },
                ]}
                min={lowMaxGasPrice}
                max={highMaxGasPrice}
                value={maxGasPrice}
                onChange={onCurrentMaxGasPriceChange}
                valueLabelFormat={(value) => value.toFixed(2)}
              />
            </Box>
          )}
          <Box className={styles.gasPriceHelpBox}>
            <FormHelperText className={styles.gasPriceHelp}>
              {maxGasPrice.toFixed(2)} {gasPriceUnit.toString()}
            </FormHelperText>
          </Box>
        </Box>
      </FormRow>
      {useEip1559 && (
        <FormRow>
          <FormLabel top>Priority gas price</FormLabel>
          <Box className={styles.inputField}>
            <Box className={styles.gasPriceTypeBox}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentUseStdPriorityGasPrice}
                    disabled={initializing}
                    onChange={onUseStdPriorityGasPriceChange}
                    color="primary"
                  />
                }
                label={currentUseStdPriorityGasPrice ? 'Standard Price' : 'Custom Price'}
              />
            </Box>
            {!currentUseStdPriorityGasPrice && (
              <Box className={styles.gasPriceSliderBox}>
                <Slider
                  className={styles.gasPriceSlider}
                  classes={{
                    markLabel: styles.gasPriceMarkLabel,
                    valueLabel: styles.gasPriceValueLabel,
                  }}
                  getAriaValueText={() => `${priorityGasPrice.toFixed(2)} ${gasPriceUnit.toString()}`}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  step={0.01}
                  marks={[
                    { value: lowPriorityGasPrice, label: 'Slow' },
                    { value: highPriorityGasPrice, label: 'Urgent' },
                  ]}
                  min={lowPriorityGasPrice}
                  max={highPriorityGasPrice}
                  value={priorityGasPrice}
                  onChange={onCurrentPriorityGasPriceChange}
                  valueLabelFormat={(value) => value.toFixed(2)}
                />
              </Box>
            )}
            <Box className={styles.gasPriceHelpBox}>
              <FormHelperText className={styles.gasPriceHelp}>
                {priorityGasPrice.toFixed(2)} {gasPriceUnit.toString()}
              </FormHelperText>
            </Box>
          </Box>
        </FormRow>
      )}
    </FormAccordion>
  );
};

export default EthTxSettings;
