import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { workflow } from '@emeraldwallet/core';
import { Button, ButtonGroup } from '@emeraldwallet/ui';
import { Box, createStyles, FormControlLabel, FormHelperText, Slider, Switch, withStyles } from '@material-ui/core';
import * as React from 'react';
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
  getBalancesByAddress: (address: string) => string[];

  classes: Record<keyof typeof styles, string>;

  maximalGasPrice: string;
  minimalGasPrice: string;
  standardGasPrice: string;

  onSetGasPrice?: (value: number) => void;
}

interface State {
  currentGasPrice: number;
  useStdGasPrice: boolean;
}

class CreateTransaction extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentGasPrice: 0,
      useStdGasPrice: true,
    };
  }

  public componentDidUpdate(prevProps: Props): void {
    if (prevProps.standardGasPrice !== this.props.standardGasPrice) {
      const standard = new Wei(this.props.standardGasPrice, 'Wei');

      this.setState({ currentGasPrice: standard.getNumberByUnit(standard.getOptimalUnit()).toNumber() });
    }
  }

  public getDisabled = (): boolean => {
    const gasPrice = new Wei(this.props.standardGasPrice);

    return gasPrice.isZero() || this.props.tx.validate() !== ValidationResult.OK;
  };

  public render(): React.ReactElement {
    const maximum = new Wei(this.props.maximalGasPrice, 'Wei');
    const minimum = new Wei(this.props.minimalGasPrice, 'Wei');
    const standard = new Wei(this.props.standardGasPrice, 'Wei');

    const unit = standard.getOptimalUnit();

    const maximalGasPrice = maximum.getNumberByUnit(unit);
    const minimalGasPrice = minimum.getNumberByUnit(unit);
    const standardGasPrice = standard.getNumberByUnit(unit);

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
          <FormLabel>Gas price</FormLabel>
          <Box className={this.props.classes.inputField}>
            <Box className={this.props.classes.gasPriceTypeBox}>
              <FormControlLabel
                control={
                  <Switch
                    checked={this.state.useStdGasPrice}
                    onChange={(event) => {
                      const checked = event.target.checked;

                      if (checked) {
                        this.props.onSetGasPrice?.(standardGasPrice.toNumber());
                      }

                      this.setState({ useStdGasPrice: checked });
                    }}
                    name="checkedB"
                    color="primary"
                  />
                }
                label={this.state.useStdGasPrice ? 'Standard Gas Price' : 'Custom Gas Price'}
              />
            </Box>
            {!this.state.useStdGasPrice && (
              <Box className={this.props.classes.gasPriceSliderBox}>
                <Slider
                  className={this.props.classes.gasPriceSlider}
                  classes={{ markLabel: this.props.classes.gasPriceMarkLabel }}
                  defaultValue={standardGasPrice.toNumber()}
                  getAriaValueText={() => `${this.state.currentGasPrice.toFixed(2)} ${unit.toString()}`}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  step={0.01}
                  marks={[
                    { value: minimalGasPrice.toNumber(), label: 'Slow' },
                    { value: maximalGasPrice.toNumber(), label: 'Urgent' },
                  ]}
                  min={minimalGasPrice.toNumber()}
                  max={maximalGasPrice.toNumber()}
                  onChange={(e, value) => {
                    this.setState({ currentGasPrice: value as number });
                    this.props.onSetGasPrice?.(value as number);
                  }}
                  valueLabelFormat={(value) => value.toFixed(2)}
                />
              </Box>
            )}
            <Box className={this.props.classes.gasPriceHelpBox}>
              <FormHelperText className={this.props.classes.gasPriceHelp}>
                {this.state.currentGasPrice.toFixed(2)} {unit.toString()}
              </FormHelperText>
            </Box>
          </Box>
        </FormFieldWrapper>
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
