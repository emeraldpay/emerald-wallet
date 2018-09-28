import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { translate } from 'react-i18next';
import classNames from 'classnames/bind';
import muiThemeable from 'material-ui/styles/muiThemeable';
import createLogger from '../../../utils/logger';

import screen from '../../../store/wallet/screen';
import launcher from '../../../store/launcher';
import Account from './account';

const styles = {
  container: {
    marginBottom: '10px',
  },

  listItem: {
    marginBottom: '10px',
  },

  hiddenListItem: {
    opacity: '0.4',
  },
};

const log = createLogger('AccountList');
const cx = classNames.bind(styles);

const AccountList = translate('accounts')((props) => {
  log.trace('Rendering AccountList');
  const { accounts, showFiat } = props;
  const { openAccount, createTx, showReceiveDialog, muiTheme } = props;
  return (
    <div style={ styles.container } >
      {accounts.map((account) => {
        const className = cx({
          listItem: true,
          hiddenListItem: account.get('hidden'),
        });
        return (<div className={ className } key={ account.get('id') } style={{border: `1px solid ${muiTheme.palette.borderColor}`}}>
          <Account
            showFiat={ showFiat }
            account={ account }
            openAccount={ openAccount }
            createTx={ createTx }
            showReceiveDialog={ showReceiveDialog }
          />
        </div>);
      })}
    </div>
  );
});

AccountList.propTypes = {
  showFiat: PropTypes.bool,
  accounts: PropTypes.object.isRequired,
};

export default connect(
  (state, ownProps) => ({
    accounts: state.accounts.get('accounts', Immutable.List()),
    showFiat: launcher.selectors.getChainName(state).toLowerCase() === 'mainnet',
  }),
  (dispatch, ownProps) => ({
    openAccount: (account) => {
      dispatch(screen.actions.gotoScreen('account', account));
    },
    createTx: (account) => {
      dispatch(screen.actions.gotoScreen('create-tx', account));
    },
    showReceiveDialog: (account) => {
      dispatch(screen.actions.showDialog('receive', account));
    },
  })
)(muiThemeable()(AccountList));
