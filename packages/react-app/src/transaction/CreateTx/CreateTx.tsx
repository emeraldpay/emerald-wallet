import { BigAmount, Unit } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, TokenRegistry, amountFactory, workflow } from '@emeraldwallet/core';
import { GasPrices } from '@emeraldwallet/store';
import { Button, ButtonGroup, FormAccordion, FormLabel, FormRow } from '@emeraldwallet/ui';
import {
  Box,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Slider,
  Switch,
  WithStyles,
  createStyles,
  withStyles,
} from '@material-ui/core';
import * as React from 'react';
import AmountField from './AmountField';
import FromField from './FromField';
import ToField from './ToField';
import TokenField from './TokenField';

const { ValidationResult } = workflow;

const styles = createStyles({
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
  buttons: {
    display: 'flex',
    justifyContent: 'end',
    width: '100%',
  },
});

export interface Props extends WithStyles<typeof styles> {
  chain: BlockchainCode;
  currency?: string;
  eip1559: boolean;
  fiatBalance?: string | null;
  initializing: boolean;
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
  getTokenBalance(token: string, address?: string): BigAmount;
  onCancel?(): void;
  onChangeAmount?(amount: BigAmount): void;
  onChangeFrom?(from: string): void;
  onChangeGasLimit?(value: string): void;
  onChangeTo(to: string): void;
  onChangeToken?(tokenSymbol: string): void;
  onChangeUseEip1559(value: boolean, max: number, priority: number): void;
  onMaxClicked?(): void;
  onSetMaxGasPrice?(value: number, unit: Unit): void;
  onSetPriorityGasPrice?(value: number, unit: Unit): void;
  onSubmit?(): void;
}

interface State {
  currentMaxGasPrice: number;
  currentPriorityGasPrice: number;
  useEip1559: boolean;
  useStdMaxGasPrice: boolean;
  useStdPriorityGasPrice: boolean;
}

class CreateTx extends React.Component<Props, State> {
  private readonly minimalUnit = new Unit(9, '', undefined);

  constructor(props: Props) {
    super(props);

    this.state = {
      currentMaxGasPrice: 0,
      currentPriorityGasPrice: 0,
      useEip1559: props.eip1559,
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

  public getBalanceByToken = (token: string): BigAmount => {
    const { tx, getBalance, getTokenBalance } = this.props;

    if (tx.from == null) {
      return amountFactory(tx.blockchain)(0);
    }

    if (this.props.tokenRegistry.hasSymbol(tx.blockchain, token.toUpperCase())) {
      return getTokenBalance(token, tx.from);
    }

    return getBalance(tx.from);
  };

  public render(): React.ReactElement {
    const {
      chain,
      classes,
      currency,
      fiatBalance,
      initializing,
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
      onChangeUseEip1559,
      onMaxClicked,
      onSetMaxGasPrice,
      onSetPriorityGasPrice,
      onSubmit,
    } = this.props;
    const { currentMaxGasPrice, currentPriorityGasPrice, useEip1559, useStdMaxGasPrice, useStdPriorityGasPrice } =
      this.state;

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
      <>
        <FormRow>
          <FromField
            accounts={ownAddresses}
            disabled={initializing}
            selectedAccount={tx.from}
            onChangeAccount={onChangeFrom}
            getBalancesByAddress={getBalancesByAddress}
          />
        </FormRow>
        <FormRow>
          <TokenField
            balance={tx.getTotalBalance()}
            fiatBalance={fiatBalance}
            fiatCurrency={currency}
            selectedToken={token}
            tokenSymbols={tokenSymbols}
            getBalanceByToken={this.getBalanceByToken}
            onChangeToken={onChangeToken}
          />
        </FormRow>
        <FormRow>
          <ToField blockchain={chain} to={tx.to} onChange={onChangeTo} />
        </FormRow>
        <FormRow>
          <AmountField
            amount={tx.getAmount()}
            maxDisabled={initializing}
            units={tx.getAmount().units}
            onChangeAmount={
              onChangeAmount ||
              ((): void => {
                /* Do nothing */
              })
            }
            onMaxClicked={onMaxClicked}
          />
        </FormRow>
        <FormAccordion
          title={
            <FormRow last>
              <FormLabel>Settings</FormLabel>
              {useEip1559 ? 'EIP-1559' : 'Basic Type'} / {currentMaxGasPrice.toFixed(2)} {unit.toString()}
              {useEip1559 ? ' Max Gas Price' : ' Gas Price'}
              {useEip1559 ? ` / ${currentPriorityGasPrice.toFixed(2)} ${unit.toString()} Priority Gas Price` : null}
            </FormRow>
          }
        >
          <FormRow>
            <FormLabel>Use EIP-1559</FormLabel>
            <FormControlLabel
              control={
                <Switch
                  checked={useEip1559}
                  color="primary"
                  disabled={initializing}
                  onChange={({ target: { checked } }) => {
                    this.setState({ useEip1559: checked });

                    onChangeUseEip1559(checked, currentMaxGasPrice, currentPriorityGasPrice);
                  }}
                />
              }
              label={useEip1559 ? 'Enabled' : 'Disabled'}
            />
          </FormRow>
          <FormRow>
            <FormLabel top>{useEip1559 ? 'Max gas price' : 'Gas price'}</FormLabel>
            <Box className={classes.inputField}>
              <Box className={classes.gasPriceTypeBox}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useStdMaxGasPrice}
                      disabled={initializing}
                      onChange={({ target: { checked } }) => {
                        if (checked) {
                          this.setState({ currentMaxGasPrice: stdMaxGasPriceNumber });

                          onSetMaxGasPrice?.(stdMaxGasPriceNumber, unit);
                        }

                        this.setState({ useStdMaxGasPrice: checked });
                      }}
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
                    value={currentMaxGasPrice}
                    onChange={(event, value) => {
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
          </FormRow>
          {useEip1559 && (
            <FormRow>
              <FormLabel top>Priority gas price</FormLabel>
              <Box className={classes.inputField}>
                <Box className={classes.gasPriceTypeBox}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useStdPriorityGasPrice}
                        disabled={initializing}
                        onChange={({ target: { checked } }) => {
                          if (checked) {
                            this.setState({ currentPriorityGasPrice: stdPriorityGasPriceNumber });

                            onSetPriorityGasPrice?.(stdPriorityGasPriceNumber, unit);
                          }

                          this.setState({ useStdPriorityGasPrice: checked });
                        }}
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
                      value={currentPriorityGasPrice}
                      onChange={(event, value) => {
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
            </FormRow>
          )}
        </FormAccordion>
        <FormRow last>
          <FormLabel />
          <ButtonGroup classes={{ container: classes.buttons }}>
            {initializing && (
              <Button disabled icon={<CircularProgress size={16} />} label="Checking the network" variant="text" />
            )}
            <Button label="Cancel" onClick={onCancel} />
            <Button
              primary
              disabled={initializing || tx.validate() !== ValidationResult.OK}
              label="Create Transaction"
              onClick={onSubmit}
            />
          </ButtonGroup>
        </FormRow>
      </>
    );
  }
}

export default withStyles(styles)(CreateTx);
