import { Unit } from '@emeraldpay/bigamount';
import { Wei, WeiAny } from '@emeraldpay/bigamount-crypto';
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
  maxGasPrice: WeiAny;
  stdMaxGasPrice: WeiAny;
  lowMaxGasPrice: WeiAny;
  highMaxGasPrice: WeiAny;
  priorityGasPrice: WeiAny;
  stdPriorityGasPrice: WeiAny;
  lowPriorityGasPrice: WeiAny;
  highPriorityGasPrice: WeiAny;
  onUse1559Change(value: boolean): void;
  onMaxGasPriceChange(value: WeiAny): void;
  onPriorityGasPriceChange(value: WeiAny): void;
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

  const toWeiInCurrentUnits = (decimal: number): Wei => new Wei(decimal, gasPriceUnit);

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
    const [gasPriceDecimal] = Array.isArray(value) ? value : [value];

    onMaxGasPriceChange(toWeiInCurrentUnits(gasPriceDecimal));
  };

  const onUseStdPriorityGasPriceChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    setCurrentUseStdPriorityGasPrice(checked);

    if (checked) {
      onPriorityGasPriceChange(stdPriorityGasPrice);
    }
  };

  const onCurrentPriorityGasPriceChange = (event: React.ChangeEvent<unknown>, value: number | number[]): void => {
    const [gasPriceDecimal] = Array.isArray(value) ? value : [value];

    onPriorityGasPriceChange(toWeiInCurrentUnits(gasPriceDecimal));
  };

  const maxGasPriceByUnit = maxGasPrice.getNumberByUnit(gasPriceUnit).toFixed(2);
  const priorityGasPriceByUnit = priorityGasPrice.getNumberByUnit(gasPriceUnit).toFixed(2);

  return (
    <FormAccordion
      title={
        <FormRow last>
          <FormLabel>Settings</FormLabel>
          {useEip1559 ? 'EIP-1559' : 'Basic Type'} / {maxGasPriceByUnit} {gasPriceUnit.toString()}
          {useEip1559 ? ' Max Gas Price' : ' Gas Price'}
          {useEip1559 ? ` / ${priorityGasPriceByUnit} ${gasPriceUnit.toString()} Priority Gas Price` : null}
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
                getAriaValueText={() => `${maxGasPriceByUnit} ${gasPriceUnit.toString()}`}
                aria-labelledby="discrete-slider"
                valueLabelDisplay="auto"
                step={0.01}
                marks={[
                  { value: lowMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber(), label: 'Slow' },
                  { value: highMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber(), label: 'Urgent' },
                ]}
                min={lowMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
                max={highMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
                value={maxGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
                onChange={onCurrentMaxGasPriceChange}
                valueLabelFormat={(value) => value.toFixed(2)}
              />
            </Box>
          )}
          <Box className={styles.gasPriceHelpBox}>
            <FormHelperText className={styles.gasPriceHelp}>
              {maxGasPrice.getNumberByUnit(gasPriceUnit).toFixed(2)} {gasPriceUnit.toString()}
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
                  getAriaValueText={() => `${priorityGasPriceByUnit} ${gasPriceUnit.toString()}`}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  step={0.01}
                  marks={[
                    { value: lowPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber(), label: 'Slow' },
                    { value: highPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber(), label: 'Urgent' },
                  ]}
                  min={lowPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
                  max={highPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
                  value={priorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
                  onChange={onCurrentPriorityGasPriceChange}
                  valueLabelFormat={(value) => value.toFixed(2)}
                />
              </Box>
            )}
            <Box className={styles.gasPriceHelpBox}>
              <FormHelperText className={styles.gasPriceHelp}>
                {priorityGasPrice.getNumberByUnit(gasPriceUnit).toFixed(2)} {gasPriceUnit.toString()}
              </FormHelperText>
            </Box>
          </Box>
        </FormRow>
      )}
    </FormAccordion>
  );
};

export default EthTxSettings;
