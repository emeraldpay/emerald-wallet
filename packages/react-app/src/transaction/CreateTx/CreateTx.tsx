import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { workflow } from '@emeraldwallet/core';
import { Button, ButtonGroup } from '@emeraldwallet/ui';
import { Box, createStyles, FormControlLabel, FormHelperText, Slider, Switch, withStyles } from '@material-ui/core';
import * as React from 'react';
import { GasPrices } from '../CreateTransaction/CreateTransaction';
import AmountField from './AmountField';
import FormFieldWrapper from './FormFieldWrapper';
import FormLabel from './FormLabel';
import FromField from './FromField';
import ToField from './ToField';
import TokenField from './TokenField';

const styles = createStyles({
  inputField: {
    flexGrow: 5,
  },
  toField: {
    width: 500,
  },
  amountField: {
    width: 300,
  },
  gasPriceTypeBox: {
    width: 240,
    float: 'left',
    height: 40,
  },
  gasPriceSliderBox: {
    width: 300,
    float: 'left',
  },
  gasPriceHelpBox: {
    width: 500,
    clear: 'left',
  },
  gasPriceSlider: {
    width: 300,
    marginBottom: 10,
    paddingTop: 10,
  },
  gasPriceHelp: {
    position: 'initial',
    paddingLeft: 10,
  },
  withHelp: {
    minHeight: 80,
  },
  gasPriceMarkLabel: {
    fontSize: '0.7em',
    opacity: 0.8,
  },
  gasPriceValueLabel: {
    fontSize: '0.7em',
  },
});

const { ValidationResult } = workflow;

export interface Props {
  tx: workflow.CreateEthereumTx | workflow.CreateERC20Tx;
  token: string;

  /** Available tokens / currencies for transfer */
  tokenSymbols: string[];
  addressBookAddresses?: string[];
  currency?: string;
  txFeeToken: string;
  fiatBalance?: string;
  ownAddresses?: string[];
  onSubmit?: () => void;
  onCancel?: () => void;
  onChangeTo?: (to: string) => void;
  onChangeAmount?: (amount: BigAmount) => void;
  onChangeFrom?: (from: string) => void;
  onChangeGasLimit?: (value: string) => void;
  onChangeToken?: (tokenSymbol: string) => void;
  onEmptyAddressBookClick?: () => void;
  onMaxClicked?: () => void;
  getBalancesByAddress?: (address: string) => string[];

  classes: Record<keyof typeof styles, string>;

  eip1559: boolean;

  highGasPrice: GasPrices;
  lowGasPrice: GasPrices;
  stdGasPrice: GasPrices;

  onSetMaxGasPrice?: (value: number) => void;
  onSetPriorityGasPrice?: (value: number) => void;
}

interface State {
  currentMaxGasPrice: number;
  currentPriorityGasPrice: number;
  useStdMaxGasPrice: boolean;
  useStdPriorityGasPrice: boolean;
}

class CreateTransaction extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentMaxGasPrice: 0,
      currentPriorityGasPrice: 0,
      useStdMaxGasPrice: true,
      useStdPriorityGasPrice: true,
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    const feeProp = this.props.eip1559 ? 'max' : 'expect';

    if (prevProps.stdGasPrice[feeProp] !== this.props.stdGasPrice[feeProp]) {
      const stdMaxGasPrice = new Wei(this.props.stdGasPrice[feeProp], 'Wei');

      this.setState({
        currentMaxGasPrice: stdMaxGasPrice.getNumberByUnit(stdMaxGasPrice.getOptimalUnit()).toNumber(),
      });
    }

    if (prevProps.stdGasPrice.priority !== this.props.stdGasPrice.priority) {
      const stdPriorityGasPrice = new Wei(this.props.stdGasPrice.priority, 'Wei');

      this.setState({
        currentPriorityGasPrice: stdPriorityGasPrice.getNumberByUnit(stdPriorityGasPrice.getOptimalUnit()).toNumber(),
      });
    }
  }

  public getDisabled = (): boolean => {
    const gasPrice = new Wei(this.props.stdGasPrice[this.props.eip1559 ? 'max' : 'expect']);

    return gasPrice.isZero() || this.props.tx.validate() !== ValidationResult.OK;
  };

  public render(): React.ReactElement {
    const feeProp = this.props.eip1559 ? 'max' : 'expect';

    const highMaxGasPrice = new Wei(this.props.highGasPrice[feeProp], 'Wei');
    const lowMaxGasPrice = new Wei(this.props.lowGasPrice[feeProp], 'Wei');
    const stdMaxGasPrice = new Wei(this.props.stdGasPrice[feeProp], 'Wei');

    const highPriorityGasPrice = new Wei(this.props.highGasPrice.priority, 'Wei');
    const lowPriorityGasPrice = new Wei(this.props.lowGasPrice.priority, 'Wei');
    const stdPriorityGasPrice = new Wei(this.props.stdGasPrice.priority, 'Wei');

    const unit = stdMaxGasPrice.getOptimalUnit();

    const highMaxGasPriceNumber = highMaxGasPrice.getNumberByUnit(unit).toNumber();
    const lowMaxGasPriceNumber = lowMaxGasPrice.getNumberByUnit(unit).toNumber();
    const stdMaxGasPriceNumber = stdMaxGasPrice.getNumberByUnit(unit).toNumber();

    const highPriorityGasPriceNumber = highPriorityGasPrice.getNumberByUnit(unit).toNumber();
    const lowPriorityGasPriceNumber = lowPriorityGasPrice.getNumberByUnit(unit).toNumber();
    const stdPriorityGasPriceNumber = stdPriorityGasPrice.getNumberByUnit(unit).toNumber();

    return (
      <div style={{ width: 800 }}>
        <FormFieldWrapper>
          <FromField
            accounts={this.props.ownAddresses}
            selectedAccount={this.props.tx.from}
            onChangeAccount={this.props.onChangeFrom}
            getBalancesByAddress={this.props.getBalancesByAddress}
          />
        </FormFieldWrapper>
        <FormFieldWrapper>
          <TokenField
            onChangeToken={this.props.onChangeToken}
            selectedToken={this.props.token}
            tokenSymbols={this.props.tokenSymbols}
            balance={this.props.tx.getTotalBalance()}
            fiatCurrency={this.props.currency}
            fiatBalance={this.props.fiatBalance}
          />
        </FormFieldWrapper>
        <FormFieldWrapper>
          <ToField
            onChangeTo={this.props.onChangeTo}
            to={this.props.tx.to}
            addressBookAddresses={this.props.addressBookAddresses}
            onEmptyAddressBookClick={this.props.onEmptyAddressBookClick}
          />
        </FormFieldWrapper>
        <FormFieldWrapper>
          <AmountField
            initialAmount={this.props.tx.getAmount()}
            units={this.props.tx.getAmount().units}
            onChangeAmount={
              this.props.onChangeAmount ||
              ((): void => {
                /* Do nothing */
              })
            }
            onMaxClicked={this.props.onMaxClicked}
          />
        </FormFieldWrapper>
        <FormFieldWrapper>
          <FormLabel>{this.props.eip1559 ? 'Max gas price' : 'Gas price'}</FormLabel>
          <Box className={this.props.classes.inputField}>
            <Box className={this.props.classes.gasPriceTypeBox}>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.useStdMaxGasPrice}
                    onChange={(event) => {
                      const checked = event.target.checked;

                      if (checked) {
                        this.setState({ currentMaxGasPrice: stdMaxGasPriceNumber });
                        this.props.onSetMaxGasPrice?.(stdMaxGasPriceNumber);
                      }

                      this.setState({ useStdMaxGasPrice: checked });
                    }}
                    name="checkedB"
                    color="primary"
                  />
                }
                label={this.state.useStdMaxGasPrice ? 'Standard Price' : 'Custom Price'}
              />
            </Box>
            {!this.state.useStdMaxGasPrice && (
              <Box className={this.props.classes.gasPriceSliderBox}>
                <Slider
                  className={this.props.classes.gasPriceSlider}
                  classes={{
                    markLabel: this.props.classes.gasPriceMarkLabel,
                    valueLabel: this.props.classes.gasPriceValueLabel,
                  }}
                  defaultValue={stdMaxGasPriceNumber}
                  getAriaValueText={() => `${this.state.currentMaxGasPrice.toFixed(2)} ${unit.toString()}`}
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
                    this.props.onSetMaxGasPrice?.(value as number);
                  }}
                  valueLabelFormat={(value) => value.toFixed(2)}
                />
              </Box>
            )}
            <Box className={this.props.classes.gasPriceHelpBox}>
              <FormHelperText className={this.props.classes.gasPriceHelp}>
                {this.state.currentMaxGasPrice.toFixed(2)} {unit.toString()}
              </FormHelperText>
            </Box>
          </Box>
        </FormFieldWrapper>
        {this.props.eip1559 && (
          <FormFieldWrapper>
            <FormLabel>Priority gas price</FormLabel>
            <Box className={this.props.classes.inputField}>
              <Box className={this.props.classes.gasPriceTypeBox}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.state.useStdPriorityGasPrice}
                      onChange={(event) => {
                        const checked = event.target.checked;

                        if (checked) {
                          this.setState({ currentPriorityGasPrice: stdPriorityGasPriceNumber });
                          this.props.onSetPriorityGasPrice?.(stdPriorityGasPriceNumber);
                        }

                        this.setState({ useStdPriorityGasPrice: checked });
                      }}
                      name="checkedB"
                      color="primary"
                    />
                  }
                  label={this.state.useStdPriorityGasPrice ? 'Standard Price' : 'Custom Price'}
                />
              </Box>
              {!this.state.useStdPriorityGasPrice && (
                <Box className={this.props.classes.gasPriceSliderBox}>
                  <Slider
                    className={this.props.classes.gasPriceSlider}
                    classes={{
                      markLabel: this.props.classes.gasPriceMarkLabel,
                      valueLabel: this.props.classes.gasPriceValueLabel,
                    }}
                    defaultValue={stdPriorityGasPriceNumber}
                    getAriaValueText={() => `${this.state.currentPriorityGasPrice.toFixed(2)} ${unit.toString()}`}
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
                      this.props.onSetPriorityGasPrice?.(value as number);
                    }}
                    valueLabelFormat={(value) => value.toFixed(2)}
                  />
                </Box>
              )}
              <Box className={this.props.classes.gasPriceHelpBox}>
                <FormHelperText className={this.props.classes.gasPriceHelp}>
                  {this.state.currentPriorityGasPrice.toFixed(2)} {unit.toString()}
                </FormHelperText>
              </Box>
            </Box>
          </FormFieldWrapper>
        )}
        <FormFieldWrapper style={{ paddingBottom: 0 }}>
          <FormLabel />
          <ButtonGroup style={{ flexGrow: 5 }}>
            <Button label="Cancel" onClick={this.props.onCancel} />
            <Button
              disabled={this.getDisabled()}
              primary={true}
              label="Create Transaction"
              onClick={this.props.onSubmit}
            />
          </ButtonGroup>
        </FormFieldWrapper>
      </div>
    );
  }
}

export default withStyles(styles)(CreateTransaction);
