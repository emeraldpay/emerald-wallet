import { AccountSelect } from '@emeraldplatform/ui';
import * as React from 'react';
import FormLabel from '../FormLabel';

interface Props {
  onChangeAccount?: any;
  accounts?: any;
  selectedAccount?: string;
}

class FromField extends React.Component<Props> {

  public inputStyles = {
    flexGrow: 5
  };
  constructor (props: Props) {
    super(props);
    this.onChangeAccount = this.onChangeAccount.bind(this);
  }

  public onChangeAccount (value: string) {
    this.props.onChangeAccount(value);
  }

  public render () {
    const accounts = this.props.accounts || [];
    const selectedAccount = this.props.selectedAccount || '';
    return (
      <React.Fragment>
        <FormLabel>From</FormLabel>
        <AccountSelect
          onChange={this.onChangeAccount}
          selectedAccount={selectedAccount}
          accounts={accounts}
          // containerStyle={this.inputStyles}
        />
      </React.Fragment>
    );
  }
}

export default FromField;
