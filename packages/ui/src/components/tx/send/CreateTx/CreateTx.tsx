import * as React from 'react';
import { ButtonGroup } from '@emeraldplatform/ui';
import { Wei } from '@emeraldplatform/eth';
import Button from '../../../common/Button';
import FormFieldWrapper from './FormFieldWrapper';
import FromField from './FromField';
import FormLabel from './FormLabel';
import TokenField from './TokenField';
import ToField from './ToField';
import AmountField from './AmountField';
import GasLimitField from './GasLimitField';

function getStyles() {
  return {
    width: '800px',
  };
}

export interface Props {
  from?: string;
  token: string;
  tokenSymbols?: Array<string>;
  balance: Wei;
  amount?: Wei;
  addressBookAddresses?: Array<string>;
  to?: string;
  currency?: string;
  gasLimit: string;
  txFeeFiat?: string;
  txFee: Wei;
  txFeeToken: string;
  fiatBalance?: string;
  ownAddresses?: Array<string>;
  onSubmit?: Function;
  onCancel?: any;
  onChangeTo?: any;
  onChangeAmount?: Function;
  onChangeFrom?: any;
  onChangeGasLimit?: any;
  onChangeToken?: any;
  onEmptyAddressBookClick?: any;
  onMaxClicked?: any;
}

class CreateTransaction extends React.Component<Props> {
  getDisabled = () => {
    return !this.props.to || !this.props.from || this.props.amount == null;
  };

  render() {
    return (
      <div style={getStyles()}>
        <FormFieldWrapper>
          <FromField
            onChangeAccount={this.props.onChangeFrom}
            selectedAccount={this.props.from}
            accounts={this.props.ownAddresses}
          />
        </FormFieldWrapper>

        <FormFieldWrapper>
          <TokenField
            onChangeToken={this.props.onChangeToken}
            selectedToken={this.props.token}
            tokenSymbols={this.props.tokenSymbols}
            balance={this.props.balance}
            fiatCurrency={this.props.currency}
            fiatBalance={this.props.fiatBalance}
          />
        </FormFieldWrapper>

        <FormFieldWrapper>
          <ToField
            onChangeTo={this.props.onChangeTo}
            to={this.props.to}
            addressBookAddresses={this.props.addressBookAddresses}
            onEmptyAddressBookClick={this.props.onEmptyAddressBookClick}
          />
        </FormFieldWrapper>

        <FormFieldWrapper>
          <AmountField
            amount={this.props.amount}
            onChangeAmount={this.props.onChangeAmount}
            onMaxClicked={this.props.onMaxClicked}
          />
        </FormFieldWrapper>

        <FormFieldWrapper>
          <GasLimitField
            onChangeGasLimit={this.props.onChangeGasLimit}
            gasLimit={this.props.gasLimit}
            txFee={this.props.txFee}
            txFeeToken={this.props.txFeeToken}
            txFeeFiat={this.props.txFeeFiat}
            fiatCurrency={this.props.currency}
          />
        </FormFieldWrapper>

        <FormFieldWrapper style={{ paddingBottom: '0px' }}>
          <FormLabel />
          <ButtonGroup style={{flexGrow: 5}}>
            <Button
              label="Cancel"
              onClick={this.props.onCancel}/>
            <Button
              disabled={this.getDisabled()}
              primary
              label="Create Transaction"
              onClick={this.props.onSubmit}
            />
          </ButtonGroup>
        </FormFieldWrapper>
      </div>
    );
  }
}


export default CreateTransaction;
