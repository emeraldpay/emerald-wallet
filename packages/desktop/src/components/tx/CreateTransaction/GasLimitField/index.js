import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'emerald-js-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';

import FormLabel from '../FormLabel';

function getStyles(muiTheme) {
  return {
    fontFamily: muiTheme.fontFamily,
    color: muiTheme.palette.secondaryTextColor,
    wordSpacing: '3px',
    letterSpacing: '1px',
    fontWeight: '200',
    paddingLeft: '20px',
    fontSize: '14px',
  };
}


class GasLimitField extends React.Component {
  static propTypes = {
    onChangeGasLimit: PropTypes.func.isRequired,
    txFee: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
    gasLimit: PropTypes.string.isRequired,
    txFeeFiat: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
    muiTheme: PropTypes.string.isRequired,
  }

  constructor() {
    super();
    this.onChangeGasLimit = this.onChangeGasLimit.bind(this);
  }

  onChangeGasLimit(event, amount) {
    this.props.onChangeGasLimit(amount);
  }

  render() {
    return (
      <Fragment>
        <FormLabel>Gas Limit</FormLabel>
        <Input
          type="number"
          value={this.props.gasLimit}
          min="21000"
          onChange={this.onChangeGasLimit}
        />
        <div style={getStyles(this.props.muiTheme)}>{this.props.txFee} ETC   /   {this.props.txFeeFiat} {this.props.currency}</div>
      </Fragment>
    );
  }
}

export default muiThemeable()(GasLimitField);
