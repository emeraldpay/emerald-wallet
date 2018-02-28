// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { FlatButton } from 'material-ui';
import { connect } from 'react-redux';
import { Wei } from 'emerald-js';
import EtcLogo from 'emerald-js-ui/lib/icons2/EtcLogo';
import muiThemeable from 'material-ui/styles/muiThemeable';
import accounts from '../../../store/vault/accounts';
import { Currency } from '../../../lib/currency';

type Props = {
  total: string
};

const styles = {
  label: {
    marginLeft: '-5px',
    fontSize: '16px',
    fontWeight: 'normal',
  },
};

const Total = ({ total, muiTheme }: Props) => {
  const totalFormatted = `${total} ETC`;
  return (
    <FlatButton
      disabled={true}
      icon={<EtcLogo />}
      labelStyle={styles.label}
      label={totalFormatted}
      style={{color: muiTheme.palette.alternateTextColor, lineHeight: 'inherit'}} />
  );
};

Total.propTypes = {
  total: PropTypes.string.isRequired,
};

export default connect(
  (state, ownProps) => {
    // Sum of balances of all known accounts.
    const total: Wei = accounts.selectors.selectTotalBalance(state);

    return {
      total: total.getEther(),
    };
  },
  (dispatch, ownProps) => ({})
)(muiThemeable()(Total));
