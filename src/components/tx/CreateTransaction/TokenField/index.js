import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { SelectField } from 'emerald-js-ui';
import { MenuItem } from 'material-ui';
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
  };
}

class TokenField extends React.Component {
  static propTypes = {
    onChangeToken: PropTypes.func.isRequired,
    selectedToken: PropTypes.string.isRequired,
    tokenSymbols: PropTypes.arrayOf(PropTypes.string).isRequired,
    balance: PropTypes.string.isRequired,
    fiatBalance: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
  }

  constructor() {
    super();
    this.onChangeToken = this.onChangeToken.bind(this);
  }

  onChangeToken(event, value) {
    this.props.onChangeToken(this.props.tokenSymbols[value]);
  }

  render() {
    return (
      <Fragment>
        <FormLabel>Token</FormLabel>

        <SelectField value={this.props.selectedToken} onChange={this.onChangeToken}>
          {this.props.tokenSymbols.map((toke) => <MenuItem
            key={toke}
            value={toke}
            label={toke}
            primaryText={toke}
          />)}
        </SelectField>

        <div style={getStyles(this.props.muiTheme)}>
          {this.props.balance} {this.props.selectedToken}   /   {this.props.fiatBalance} {this.props.currency}
        </div>
      </Fragment>
    );
  }
}

export default muiThemeable()(TokenField);
