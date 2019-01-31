import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { SelectAddressInput } from 'emerald-js-ui';
import FormLabel from '../FormLabel';

class FromField extends React.Component {
  static propTypes = {
    onChangeAccount: PropTypes.func.isRequired,
    selectedAccount: PropTypes.string.isRequired,
  }

  constructor() {
    super();
    this.onChangeAccount = this.onChangeAccount.bind(this);
  }

  onChangeAccount(list, index) {
    this.props.onChangeAccount(list[index]);
  }

  inputStyles = {
    flexGrow: 5,
  }

  render() {
    return (
      <Fragment>
        <FormLabel>From</FormLabel>
        <SelectAddressInput
          onChangeAccount={this.onChangeAccount}
          selectedAccount={this.props.selectedAccount}
          accounts={this.props.accounts}
          containerStyle={this.inputStyles}
        />
      </Fragment>
    );
  }
}

export default FromField;
