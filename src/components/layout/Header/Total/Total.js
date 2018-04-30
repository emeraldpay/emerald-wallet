// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Wei } from 'emerald-js';
import { EtcSimple } from 'emerald-js-ui/lib/icons3';
import muiThemeable from 'material-ui/styles/muiThemeable';
import accounts from '../../../../store/vault/accounts';

import styles from './Total.scss';

type Props = {
  total: string
};

const Total = ({ total, muiTheme }: Props) => {
  const totalFormatted = `${total} ETC`;
  return (
    <div className={styles.container}>
      <div><EtcSimple style={{color: muiTheme.palette.secondaryTextColor}}/></div>
      <div className={styles.label} style={{color: muiTheme.palette.secondaryTextColor}}>{totalFormatted}</div>
    </div>
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
