import React from 'react';
import { connect } from 'react-redux';
import {LedgerAddrList} from '@emeraldwallet/ui';
import AccountBalance from '../../accounts/Balance';
import ledger from '../../../store/ledger';

export default connect(
  (state, ownProps) => ({
    selectedAddress: state.ledger.get('selectedAddr'),
    addresses: state.ledger.get('addresses'),
    accounts: state.accounts.get('accounts'),
    balanceRender: (balance) => (<AccountBalance symbol="ETC" balance={balance} showFiat={true} withAvatar={false} />), // eslint-disable-line
  }),
  (dispatch, ownProps) => ({
    setSelectedAddr: (addr) => {
      dispatch(ledger.actions.selectAddr(addr));
    },
  })
)(LedgerAddrList);
