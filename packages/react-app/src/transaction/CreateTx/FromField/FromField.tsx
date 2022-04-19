import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { AccountSelect } from '@emeraldwallet/ui';
import * as React from 'react';
import FormLabel from '../FormLabel';

interface OwnProps {
  accounts?: string[];
  selectedAccount?: string;
  getBalancesByAddress(address: string): string[];
  onChangeAccount?(account: string): void;
}

class FromField extends React.Component<OwnProps> {
  constructor(props: OwnProps) {
    super(props);
  }

  public render(): React.ReactElement {
    const { accounts = [], selectedAccount = '', getBalancesByAddress, onChangeAccount } = this.props;

    return (
      <React.Fragment>
        <FormLabel>From</FormLabel>
        <AccountSelect
          accounts={accounts}
          selectedAccount={selectedAccount}
          getBalancesByAddress={getBalancesByAddress}
          onChange={onChangeAccount}
        />
      </React.Fragment>
    );
  }
}

export default FromField;
