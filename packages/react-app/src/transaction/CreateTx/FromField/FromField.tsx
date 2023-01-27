import { AccountSelect, FormLabel } from '@emeraldwallet/ui';
import * as React from 'react';

interface OwnProps {
  accounts?: string[];
  disabled?: boolean;
  selectedAccount?: string;
  getBalancesByAddress?(address: string): string[];
  onChangeAccount?(account: string): void;
}

class FromField extends React.Component<OwnProps> {
  constructor(props: OwnProps) {
    super(props);
  }

  public render(): React.ReactElement {
    const { accounts = [], disabled = false, selectedAccount = '', getBalancesByAddress, onChangeAccount } = this.props;

    return (
      <React.Fragment>
        <FormLabel>From</FormLabel>
        <AccountSelect
          accounts={accounts}
          disabled={disabled}
          selectedAccount={selectedAccount}
          getBalancesByAddress={getBalancesByAddress}
          onChange={onChangeAccount}
        />
      </React.Fragment>
    );
  }
}

export default FromField;
