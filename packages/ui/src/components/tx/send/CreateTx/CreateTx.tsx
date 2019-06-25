import * as React from 'react';
import {ButtonGroup} from '@emeraldplatform/ui';
import Button from '../../../common/Button';
import FormFieldWrapper from './FormFieldWrapper';
import FromField from './FromField';
import FormLabel from './FormLabel';
import TokenField from './TokenField';
import ToField from './ToField';
import AmountField from './AmountField';
import GasLimitField from './GasLimitField';
import {CreateEthereumTx, ValidationResult} from "@emeraldwallet/workflow";

function getStyles() {
  return {
    width: '800px',
  };
}

export interface Props {
  tx: CreateEthereumTx,
  token: string;
  tokenSymbols?: Array<string>;
  addressBookAddresses?: Array<string>;
  currency?: string;
  txFeeFiat?: string;
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
    return this.props.tx.validate() != ValidationResult.OK;
  };

  render() {
    return (
      <div style={getStyles()}>
        <FormFieldWrapper>
          <FromField
            onChangeAccount={this.props.onChangeFrom}
            selectedAccount={this.props.tx.from}
            accounts={this.props.ownAddresses}
          />
        </FormFieldWrapper>

        <FormFieldWrapper>
          <TokenField
            onChangeToken={this.props.onChangeToken}
            selectedToken={this.props.token}
            tokenSymbols={this.props.tokenSymbols}
            balance={this.props.tx.totalBalance}
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
            amount={this.props.tx.amount}
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
