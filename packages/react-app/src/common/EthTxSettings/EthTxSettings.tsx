import { CreateAmount, Unit } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import {Button, FormAccordion, FormLabel, FormRow, Input} from '@emeraldwallet/ui';
import {
  Box,
  FormControlLabel,
  FormHelperText,
  Slider,
  Switch,
  createStyles,
  makeStyles,
  TextField
} from '@material-ui/core';
import * as React from 'react';
import {useState} from "react";
import {workflow} from "@emeraldwallet/core";
import {NumberField} from "../NumberField";

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
    gasLimitEditor: {
      width: 240,
    }
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
  estimatedGasLimit: number;
  onUse1559Change(value: boolean): void;
  onMaxGasPriceChange(value: WeiAny): void;
  onPriorityGasPriceChange(value: WeiAny): void;
  onGasLimitChange(value: number): void;
}

type GasLimitFieldProps = {
  gasLimit: number;
  onOverride: (value?: number) => void;
}
const GasLimitField = ({gasLimit, onOverride}: GasLimitFieldProps) => {
  const [useDefault, setUseDefault] = useState(true);
  const [value, setValue] = useState(gasLimit);
  const [errorText, setErrorText] = useState<string | undefined>();

  const styles = useStyles();

  const onSwitch = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setUseDefault(checked);
    onOverride(!checked ? value : undefined);
  }

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseInt(event.target.value);
    setValue(newValue);
    if (isNaN(newValue)) {
      setErrorText('Invalid number');
    } else if (newValue < 21_000) {
      setErrorText('Minimum is 21,000');
    } else if (newValue > 30_000_000) {
      setErrorText('Maximum is 30,000,000');
    } else {
      setErrorText(undefined);
      onOverride(newValue);
    }
  }

  const editor = <TextField
    className={styles.gasLimitEditor}
    type="number"
    helperText={errorText != undefined ? errorText : `Estimated value: ${gasLimit}`}
    error={errorText != undefined}
    maxRows={1}
    multiline={false}
    placeholder={`${gasLimit}`}
    value={value}
    onChange={handleValueChange}
  />

  return (
    <FormRow>
      <FormLabel>Gas</FormLabel>
      <Box className={styles.inputField}>
        <Box>
        <FormControlLabel
          control={<Switch checked={useDefault} color="primary" onChange={onSwitch} />}
          label={useDefault ? `Auto (${gasLimit})` : 'Manual'}
        />
          {!useDefault && editor}
        </Box>
      </Box>
    </FormRow>
  )
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
  estimatedGasLimit,
  onUse1559Change,
  onMaxGasPriceChange,
  onPriorityGasPriceChange,
  onGasLimitChange,
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
  const [overriddenGasLimit, setOverriddenGasLimit] = React.useState<number | undefined>(undefined);

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

  const handleGasLimitOverride = (value?: number) => {
    setOverriddenGasLimit(estimatedGasLimit);
    onGasLimitChange(estimatedGasLimit);
  }

  const maxGasPriceByUnit = maxGasPrice.getNumberByUnit(gasPriceUnit).toFixed(2);
  const priorityGasPriceByUnit = priorityGasPrice.getNumberByUnit(gasPriceUnit).toFixed(2);

  const showEip1559 = supportEip1559 && useEip1559;

  const showMaxRange = lowMaxGasPrice.isPositive() && highMaxGasPrice.isPositive();
  const showPriorityRange = lowPriorityGasPrice.isPositive() && highPriorityGasPrice.isPositive();

  const currentGasLimit = overriddenGasLimit ?? estimatedGasLimit;

  return (
    <FormAccordion
      title={
        <FormRow last>
          <FormLabel>Settings</FormLabel>
          {showEip1559 ? 'EIP-1559' : 'Basic Type'} / {maxGasPriceByUnit} {gasPriceUnit.toString()}
          {showEip1559 ? ' Max Gas Price' : ' Gas Price'}
          {showEip1559 ? ` / ${priorityGasPriceByUnit} ${gasPriceUnit.toString()} Priority Gas Price` : null}
          / {currentGasLimit} gas
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
      <GasLimitField gasLimit={estimatedGasLimit} onOverride={handleGasLimitOverride} />
    </FormAccordion>
  );
};

export default EthTxSettings;
