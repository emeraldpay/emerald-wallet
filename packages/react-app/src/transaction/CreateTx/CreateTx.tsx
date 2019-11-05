import { ButtonGroup } from '@emeraldplatform/ui';
import { IUnits, workflow } from '@emeraldwallet/core';
import { Button } from '@emeraldwallet/ui';
import * as React from 'react';
import AmountField from './AmountField';
import FormFieldWrapper from './FormFieldWrapper';
import FormLabel from './FormLabel';
import FromField from './FromField';
import GasLimitField from './GasLimitField';
import ToField from './ToField';
import TokenField from './TokenField';

function getStyles () {
  return {
    width: '800px'
  };
}

const { ValidationResult } = workflow;

export interface IProps {
  tx: workflow.CreateEthereumTx | workflow.CreateERC20Tx;
  token: string;

  /** Available tokens / currencies for transfer */
  tokenSymbols: string[];
  addressBookAddresses?: string[];
  currency?: string;
  txFeeFiat?: string;
  txFeeToken: string;
  fiatBalance?: string;
  ownAddresses?: string[];
  onSubmit?: Function;
  onCancel?: any;
  onChangeTo?: any;
  onChangeAmount?: (amount: IUnits) => void;
  onChangeFrom?: any;
  onChangeGasLimit?: any;
  onChangeToken?: any;
  onEmptyAddressBookClick?: any;
  onMaxClicked?: any;
}

class CreateTransaction extends React.Component<IProps> {
  public getDisabled = () => {
    return this.props.tx.validate() !== ValidationResult.OK;
  }

  public render () {
    return (
      <div style={getStyles()}>
        <FormFieldWrapper>
          <FromField
            onChangeAccount={this.props.onChangeFrom}
            selectedAccount={this.props.tx.from}
            accounts={[this.props.tx.from!]}
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
            tokenDecimals={this.props.tx.getTotalBalance().decimals}
            amount={this.props.tx.getAmount()}
            onChangeAmount={this.props.onChangeAmount}
            onMaxClicked={this.props.onMaxClicked}
          />
        </FormFieldWrapper>

        <FormFieldWrapper>
          <GasLimitField
            onChangeGasLimit={this.props.onChangeGasLimit}
            gasLimit={this.props.tx.gas.toString()}
            txFee={this.props.tx.gasPrice}
            txFeeToken={this.props.txFeeToken}
            txFeeFiat={this.props.txFeeFiat}
            fiatCurrency={this.props.currency}
          />
        </FormFieldWrapper>

        <FormFieldWrapper style={{ paddingBottom: '0px' }}>
          <FormLabel />
          <ButtonGroup style={{ flexGrow: 5 }}>
            <Button
              label='Cancel'
              onClick={this.props.onCancel}
            />
            <Button
              disabled={this.getDisabled()}
              primary={true}
              label='Create Transaction'
              onClick={this.props.onSubmit}
            />
          </ButtonGroup>
        </FormFieldWrapper>
      </div>
    );
  }
}

export default CreateTransaction;
