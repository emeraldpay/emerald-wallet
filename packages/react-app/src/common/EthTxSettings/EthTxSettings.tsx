import { CreateAmount, Unit } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
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
  factory: CreateAmount<WeiAny>;
  initializing: boolean;
  supportEip1559: boolean;
  useEip1559: boolean;
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
  factory,
  initializing,
  supportEip1559,
  useEip1559,
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

  let gasPriceUnit: Unit = stdMaxGasPrice.getOptimalUnit(undefined, undefined, 0);

  if (supportEip1559) {
    /**
     * Make sure unit can cover both priority and actual price.
     * For priority, it's okay to have a decimal value 1/10.
     */
    gasPriceUnit = stdMaxGasPrice
      .min(stdPriorityGasPrice.multiply(10))
      .divide(2)
      .getOptimalUnit(undefined, undefined, 0);
  }

  const [currentUseStdMaxGasPrice, setCurrentUseStdMaxGasPrice] = React.useState(true);
  const [currentUseStdPriorityGasPrice, setCurrentUseStdPriorityGasPrice] = React.useState(true);

  const toWei = (decimal: number): WeiAny => WeiAny.createFor(decimal, stdMaxGasPrice.units, factory, gasPriceUnit);

  const handleUse1559Change = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    onUse1559Change(checked);
  };

  const handleUseStdMaxGasPriceChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    setCurrentUseStdMaxGasPrice(checked);

    if (checked) {
      onMaxGasPriceChange(stdMaxGasPrice);
    }
  };

  const handleMaxGasPriceChange = (event: React.ChangeEvent<unknown>, value: number | number[]): void => {
    const [gasPriceDecimal] = Array.isArray(value) ? value : [value];

    onMaxGasPriceChange(toWei(gasPriceDecimal));
  };

  const handleUseStdPriorityGasPriceChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    setCurrentUseStdPriorityGasPrice(checked);

    if (checked) {
      onPriorityGasPriceChange(stdPriorityGasPrice);
    }
  };

  const handlePriorityGasPriceChange = (event: React.ChangeEvent<unknown>, value: number | number[]): void => {
    const [gasPriceDecimal] = Array.isArray(value) ? value : [value];

    onPriorityGasPriceChange(toWei(gasPriceDecimal));
  };

  const maxGasPriceByUnit = maxGasPrice.getNumberByUnit(gasPriceUnit).toFixed(2);
  const priorityGasPriceByUnit = priorityGasPrice.getNumberByUnit(gasPriceUnit).toFixed(2);

  const showEip1559 = supportEip1559 && useEip1559;

  const showMaxRange = lowMaxGasPrice.isPositive() && highMaxGasPrice.isPositive();
  const showPriorityRange = lowPriorityGasPrice.isPositive() && highPriorityGasPrice.isPositive();

  return (
    <FormAccordion
      title={
        <FormRow last>
          <FormLabel>Settings</FormLabel>
          {showEip1559 ? 'EIP-1559' : 'Basic Type'} / {maxGasPriceByUnit} {gasPriceUnit.toString()}
          {showEip1559 ? ' Max Gas Price' : ' Gas Price'}
          {showEip1559 ? ` / ${priorityGasPriceByUnit} ${gasPriceUnit.toString()} Priority Gas Price` : null}
        </FormRow>
      }
    >
      {supportEip1559 && (
        <FormRow>
          <FormLabel>Use EIP-1559</FormLabel>
          <FormControlLabel
            control={
              <Switch checked={useEip1559} color="primary" disabled={initializing} onChange={handleUse1559Change} />
            }
            label={useEip1559 ? 'Enabled' : 'Disabled'}
          />
        </FormRow>
      )}
      <FormRow>
        <FormLabel top>{showEip1559 ? 'Max gas price' : 'Gas price'}</FormLabel>
        <Box className={styles.inputField}>
          <Box className={styles.gasPriceTypeBox}>
            <FormControlLabel
              control={
                <Switch
                  checked={currentUseStdMaxGasPrice}
                  disabled={initializing && !showMaxRange}
                  onChange={handleUseStdMaxGasPriceChange}
                  color="primary"
                />
              }
              label={currentUseStdMaxGasPrice ? 'Standard Price' : 'Custom Price'}
            />
          </Box>
          {!currentUseStdMaxGasPrice && showMaxRange && (
            <Box className={styles.gasPriceSliderBox}>
              <Slider
                className={styles.gasPriceSlider}
                classes={{
                  markLabel: styles.gasPriceMarkLabel,
                  valueLabel: styles.gasPriceValueLabel,
                }}
                marks={[
                  { value: lowMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber(), label: 'Slow' },
                  { value: highMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber(), label: 'Urgent' },
                ]}
                min={lowMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
                max={highMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
                step={0.01}
                value={maxGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
                valueLabelDisplay="auto"
                onChange={handleMaxGasPriceChange}
                valueLabelFormat={(value) => value.toFixed(2)}
              />
            </Box>
          )}
          <Box className={styles.gasPriceHelpBox}>
            <FormHelperText className={styles.gasPriceHelp}>
              {maxGasPriceByUnit} {gasPriceUnit.toString()}
            </FormHelperText>
          </Box>
        </Box>
      </FormRow>
      {showEip1559 && (
        <FormRow>
          <FormLabel top>Priority gas price</FormLabel>
          <Box className={styles.inputField}>
            <Box className={styles.gasPriceTypeBox}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentUseStdPriorityGasPrice}
                    disabled={initializing && !showPriorityRange}
                    onChange={handleUseStdPriorityGasPriceChange}
                    color="primary"
                  />
                }
                label={currentUseStdPriorityGasPrice ? 'Standard Price' : 'Custom Price'}
              />
            </Box>
            {!currentUseStdPriorityGasPrice && showPriorityRange && (
              <Box className={styles.gasPriceSliderBox}>
                <Slider
                  className={styles.gasPriceSlider}
                  classes={{
                    markLabel: styles.gasPriceMarkLabel,
                    valueLabel: styles.gasPriceValueLabel,
                  }}
                  marks={[
                    { value: lowPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber(), label: 'Slow' },
                    { value: highPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber(), label: 'Urgent' },
                  ]}
                  min={lowPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
                  max={highPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
                  step={0.01}
                  value={priorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber()}
                  valueLabelDisplay="auto"
                  onChange={handlePriorityGasPriceChange}
                  valueLabelFormat={(value) => value.toFixed(2)}
                />
              </Box>
            )}
            <Box className={styles.gasPriceHelpBox}>
              <FormHelperText className={styles.gasPriceHelp}>
                {priorityGasPriceByUnit} {gasPriceUnit.toString()}
              </FormHelperText>
            </Box>
          </Box>
        </FormRow>
      )}
    </FormAccordion>
  );
};

export default EthTxSettings;
