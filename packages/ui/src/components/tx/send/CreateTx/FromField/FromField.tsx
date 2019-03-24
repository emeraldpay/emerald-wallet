import * as React from 'react';
import { AccountSelect } from '@emeraldplatform/ui';
import FormLabel from '../FormLabel';

interface Props {
  onChangeAccount?: any,
  accounts?: any;
  selectedAccount?: string,
}

class FromField extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.onChangeAccount = this.onChangeAccount.bind(this);
  }

  onChangeAccount(list: any, index: any) {
    this.props.onChangeAccount(list[index]);
  }

  inputStyles = {
    flexGrow: 5,
  };

  render() {
    const accounts = this.props.accounts || [];
    const selectedAccount = this.props.selectedAccount || '';
    return (
      <React.Fragment>
        <FormLabel>From</FormLabel>
        <AccountSelect
          onChangeAccount={this.onChangeAccount}
          selectedAccount={selectedAccount}
          accounts={accounts}
          containerStyle={this.inputStyles}
        />
      </React.Fragment>
    );
  }
}

export default FromField;
