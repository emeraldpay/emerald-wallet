import { BigAmount, Unit } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, TokenRegistry, amountFactory, workflow } from '@emeraldwallet/core';
import { GasPrices } from '@emeraldwallet/store';
import { Button, ButtonGroup } from '@emeraldwallet/ui';
import { Box, FormControlLabel, FormHelperText, Slider, Switch, createStyles, withStyles } from '@material-ui/core';
import * as React from 'react';
import AmountField from './AmountField';
import FormFieldWrapper from './FormFieldWrapper';
import FormLabel from './FormLabel';
import FromField from './FromField';
import ToField from './ToField';
import TokenField from './TokenField';

const styles = createStyles({
  container: {
    width: 800,
  },
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
});

const { ValidationResult } = workflow;

export interface Props {
  chain: BlockchainCode;
  classes: Record<keyof typeof styles, string>;
  currency?: string;
  eip1559: boolean;
  fiatBalance?: string;
  highGasPrice: GasPrices;
  lowGasPrice: GasPrices;
  ownAddresses?: string[];
  stdGasPrice: GasPrices;
  token: string;
  tokenRegistry: TokenRegistry;
  tokenSymbols: string[];
  tx: workflow.CreateEthereumTx | workflow.CreateERC20Tx;
  txFeeToken: string;
  getBalance(address: string): WeiAny;
  getBalancesByAddress?(address: string): string[];
  getTokenBalanceForAddress(address: string, token: string): BigAmount;
  onCancel?(): void;
  onChangeAmount?(amount: BigAmount): void;
  onChangeFrom?(from: string): void;
  onChangeGasLimit?(value: string): void;
  onChangeTo(to: string): void;
  onChangeToken?(tokenSymbol: string): void;
  onMaxClicked?(): void;
  onSetMaxGasPrice?(value: number, unit: Unit): void;
  onSetPriorityGasPrice?(value: number, unit: Unit): void;
  onSubmit?(): void;
}

interface State {
  currentMaxGasPrice: number;
  currentPriorityGasPrice: number;
  useStdMaxGasPrice: boolean;
  useStdPriorityGasPrice: boolean;
}

class CreateTransaction extends React.Component<Props, State> {
  private readonly minimalUnit = new Unit(9, '', undefined);

  constructor(props: Props) {
    super(props);

    this.state = {
      currentMaxGasPrice: 0,
      currentPriorityGasPrice: 0,
      useStdMaxGasPrice: true,
      useStdPriorityGasPrice: true,
    };
  }

  public componentDidUpdate({ stdGasPrice: { max: prevMax } }: Props): void {
    const {
      chain,
      stdGasPrice: { max, priority },
    } = this.props;

    if (prevMax !== max) {
      const factory = amountFactory(chain);

      const stdMaxGasPrice = factory(max);
      const stdPriorityGasPrice = factory(priority);

      const gasPriceUnit = stdMaxGasPrice.getOptimalUnit(this.minimalUnit);

      this.setState({
        currentMaxGasPrice: stdMaxGasPrice.getNumberByUnit(gasPriceUnit).toNumber(),
        currentPriorityGasPrice: stdPriorityGasPrice.getNumberByUnit(gasPriceUnit).toNumber(),
      });
    }
  }

  public getDisabled = (validate?: boolean): boolean => {
    const {
      chain,
      stdGasPrice: { max },
    } = this.props;

    const gasPrice = amountFactory(chain)(max);

    return gasPrice.isZero() || ((validate ?? true) && this.props.tx.validate() !== ValidationResult.OK);
  };

  public getBalanceByToken = (token: string): BigAmount => {
    const { tx, getBalance, getTokenBalanceForAddress } = this.props;

    if (tx.from == null) {
      return amountFactory(tx.blockchain)(0);
    }

    if (this.props.tokenRegistry.hasSymbol(tx.blockchain, token.toUpperCase())) {
      return getTokenBalanceForAddress(tx.from, token);
    }

    return getBalance(tx.from);
  };

  public render(): React.ReactElement {
    const {
      chain,
      classes,
      currency,
      eip1559,
      fiatBalance,
      highGasPrice,
      lowGasPrice,
      ownAddresses,
      stdGasPrice,
      token,
      tokenSymbols,
      tx,
      getBalancesByAddress,
      onCancel,
      onChangeAmount,
      onChangeFrom,
      onChangeTo,
      onChangeToken,
      onMaxClicked,
      onSetMaxGasPrice,
      onSetPriorityGasPrice,
      onSubmit,
    } = this.props;
    const { currentMaxGasPrice, currentPriorityGasPrice, useStdMaxGasPrice, useStdPriorityGasPrice } = this.state;

    const factory = amountFactory(chain);

    const highMaxGasPrice = factory(highGasPrice.max);
    const lowMaxGasPrice = factory(lowGasPrice.max);
    const stdMaxGasPrice = factory(stdGasPrice.max);

    const highPriorityGasPrice = factory(highGasPrice.priority);
    const lowPriorityGasPrice = factory(lowGasPrice.priority);
    const stdPriorityGasPrice = factory(stdGasPrice.priority);

    const unit = stdMaxGasPrice.getOptimalUnit(this.minimalUnit);

    const highMaxGasPriceNumber = highMaxGasPrice.getNumberByUnit(unit).toNumber();
    const lowMaxGasPriceNumber = lowMaxGasPrice.getNumberByUnit(unit).toNumber();
    const stdMaxGasPriceNumber = stdMaxGasPrice.getNumberByUnit(unit).toNumber();

    const highPriorityGasPriceNumber = highPriorityGasPrice.getNumberByUnit(unit).toNumber();
    const lowPriorityGasPriceNumber = lowPriorityGasPrice.getNumberByUnit(unit).toNumber();
    const stdPriorityGasPriceNumber = stdPriorityGasPrice.getNumberByUnit(unit).toNumber();

    return (
      <div className={classes.container}>
        <FormFieldWrapper>
          <FromField
            accounts={ownAddresses}
            disabled={this.getDisabled(false)}
            selectedAccount={tx.from}
            onChangeAccount={onChangeFrom}
            getBalancesByAddress={getBalancesByAddress}
          />
        </FormFieldWrapper>
        <FormFieldWrapper>
          <TokenField
            balance={tx.getTotalBalance()}
            fiatBalance={fiatBalance}
            fiatCurrency={currency}
            selectedToken={token}
            tokenSymbols={tokenSymbols}
            getBalanceByToken={this.getBalanceByToken}
            onChangeToken={onChangeToken}
          />
        </FormFieldWrapper>
        <FormFieldWrapper>
          <ToField blockchain={chain} to={tx.to} onChange={onChangeTo} />
        </FormFieldWrapper>
        <FormFieldWrapper>
          <AmountField
            amount={tx.getAmount()}
            units={tx.getAmount().units}
            onChangeAmount={
              onChangeAmount ||
              ((): void => {
                /* Do nothing */
              })
            }
            onMaxClicked={onMaxClicked}
          />
        </FormFieldWrapper>
        <FormFieldWrapper>
          <FormLabel>{eip1559 ? 'Max gas price' : 'Gas price'}</FormLabel>
          <Box className={classes.inputField}>
            <Box className={classes.gasPriceTypeBox}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useStdMaxGasPrice}
                    disabled={this.getDisabled(false)}
                    onChange={(event) => {
                      const checked = event.target.checked;

                      if (checked) {
                        this.setState({ currentMaxGasPrice: stdMaxGasPriceNumber });
                        onSetMaxGasPrice?.(stdMaxGasPriceNumber, unit);
                      }

                      this.setState({ useStdMaxGasPrice: checked });
                    }}
                    name="checkedB"
                    color="primary"
                  />
                }
                label={useStdMaxGasPrice ? 'Standard Price' : 'Custom Price'}
              />
            </Box>
            {!useStdMaxGasPrice && (
              <Box className={classes.gasPriceSliderBox}>
                <Slider
                  className={classes.gasPriceSlider}
                  classes={{
                    markLabel: classes.gasPriceMarkLabel,
                    valueLabel: classes.gasPriceValueLabel,
                  }}
                  defaultValue={stdMaxGasPriceNumber}
                  getAriaValueText={() => `${currentMaxGasPrice.toFixed(2)} ${unit.toString()}`}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  step={0.01}
                  marks={[
                    { value: lowMaxGasPriceNumber, label: 'Slow' },
                    { value: highMaxGasPriceNumber, label: 'Urgent' },
                  ]}
                  min={lowMaxGasPriceNumber}
                  max={highMaxGasPriceNumber}
                  onChange={(e, value) => {
                    this.setState({ currentMaxGasPrice: value as number });
                    onSetMaxGasPrice?.(value as number, unit);
                  }}
                  valueLabelFormat={(value) => value.toFixed(2)}
                />
              </Box>
            )}
            <Box className={classes.gasPriceHelpBox}>
              <FormHelperText className={classes.gasPriceHelp}>
                {currentMaxGasPrice.toFixed(2)} {unit.toString()}
              </FormHelperText>
            </Box>
          </Box>
        </FormFieldWrapper>
        {eip1559 && (
          <FormFieldWrapper>
            <FormLabel>Priority gas price</FormLabel>
            <Box className={classes.inputField}>
              <Box className={classes.gasPriceTypeBox}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useStdPriorityGasPrice}
                      disabled={this.getDisabled(false)}
                      onChange={(event) => {
                        const checked = event.target.checked;

                        if (checked) {
                          this.setState({ currentPriorityGasPrice: stdPriorityGasPriceNumber });
                          onSetPriorityGasPrice?.(stdPriorityGasPriceNumber, unit);
                        }

                        this.setState({ useStdPriorityGasPrice: checked });
                      }}
                      name="checkedB"
                      color="primary"
                    />
                  }
                  label={useStdPriorityGasPrice ? 'Standard Price' : 'Custom Price'}
                />
              </Box>
              {!useStdPriorityGasPrice && (
                <Box className={classes.gasPriceSliderBox}>
                  <Slider
                    className={classes.gasPriceSlider}
                    classes={{
                      markLabel: classes.gasPriceMarkLabel,
                      valueLabel: classes.gasPriceValueLabel,
                    }}
                    defaultValue={stdPriorityGasPriceNumber}
                    getAriaValueText={() => `${currentPriorityGasPrice.toFixed(2)} ${unit.toString()}`}
                    aria-labelledby="discrete-slider"
                    valueLabelDisplay="auto"
                    step={0.01}
                    marks={[
                      { value: lowPriorityGasPriceNumber, label: 'Slow' },
                      { value: highPriorityGasPriceNumber, label: 'Urgent' },
                    ]}
                    min={lowPriorityGasPriceNumber}
                    max={highPriorityGasPriceNumber}
                    onChange={(e, value) => {
                      this.setState({ currentPriorityGasPrice: value as number });
                      onSetPriorityGasPrice?.(value as number, unit);
                    }}
                    valueLabelFormat={(value) => value.toFixed(2)}
                  />
                </Box>
              )}
              <Box className={classes.gasPriceHelpBox}>
                <FormHelperText className={classes.gasPriceHelp}>
                  {currentPriorityGasPrice.toFixed(2)} {unit.toString()}
                </FormHelperText>
              </Box>
            </Box>
          </FormFieldWrapper>
        )}
        <FormFieldWrapper style={{ paddingBottom: 0 }}>
          <FormLabel />
          <ButtonGroup style={{ flexGrow: 5 }}>
            <Button label="Cancel" onClick={onCancel} />
            <Button disabled={this.getDisabled()} primary={true} label="Create Transaction" onClick={onSubmit} />
          </ButtonGroup>
        </FormFieldWrapper>
      </div>
    );
  }
}

export default withStyles(styles)(CreateTransaction);
