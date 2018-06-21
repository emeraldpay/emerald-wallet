// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { convert, Wei } from 'emerald-js';
import { Account, Button, ButtonGroup, Page } from 'emerald-js-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';
import launcher from 'store/launcher';
import DashboardButton from 'components/common/DashboardButton';
import { Back } from 'emerald-js-ui/lib/icons3';
import { gotoScreen } from '../../../store/wallet/screen/screenActions';
import { toDate } from '../../../lib/convert';
import { Form, styles, Row } from '../../../elements/Form';
import TxStatus from './status';
import { Currency } from '../../../lib/currency';
import createLogger from '../../../utils/logger';
import TxInputData from './TxInputData';
import classes from './show.scss';

const log = createLogger('TxDetails');

type Props = {
  showFiat: boolean,
  goBack: (?any) => void,
  openAccount: (?any) => void,
  currentCurrency: string,
  fromAccount: any,
  toAccount: any,
  rates: Map<string, number>,
  transaction: any,
  account: ?any,
  showRepeat: boolean,
}

export const TransactionShow = (props: Props) => {
  const { transaction, account, fromAccount, toAccount, openAccount, goBack, repeatTx, muiTheme } = props;
  const { showFiat, rates, currentCurrency, showRepeat } = props;

  const fieldNameStyle = {
    color: '#747474',
    fontSize: '16px',
    textAlign: 'right',
  };

  const blockNumber = transaction.get('blockNumber');
  const txStatus = blockNumber ? 'success' : 'queue';
  const fiatAmount = transaction.get('value') ?
    Currency.format(new Wei(transaction.get('value')).getFiat(rates.get(currentCurrency.toUpperCase())), currentCurrency) :
    '';

  return (
    <Page title="Transaction Details" leftIcon={ <Back onClick={() => goBack(account)} /> }>
      <Row>
        <div style={styles.left}>
          <div style={fieldNameStyle}>Date</div>
        </div>
        <div style={styles.right}>
          {transaction.get('timestamp') ? toDate(transaction.get('timestamp')) : null}
        </div>
      </Row>
      <Row>
        <div style={styles.left}>
          <div style={fieldNameStyle}>Value</div>
        </div>
        <div style={styles.right}>
          <div style={{display: 'flex'}}>
            <div>
              <div className={ classes.value }>
                { transaction.get('value') ? `${new Wei(transaction.get('value')).getEther()} ETC` : '--' }
              </div>
              {showFiat && <div className={ classes.value }>
                { fiatAmount }
              </div> }
            </div>
            <div>
              <TxStatus status={ txStatus } />
            </div>
          </div>
        </div>
      </Row>
      <br />
      <br />

      <Row>
        <div style={styles.left}>
          <div style={fieldNameStyle}>Hash</div>
        </div>
        <div style={styles.right}>
          {transaction.get('hash')}
        </div>
      </Row>

      <Row>
        <div style={styles.left}>
          <div style={fieldNameStyle}>Nonce</div>
        </div>
        <div style={styles.right}>
          { transaction.get('nonce') }
        </div>
      </Row>

      <Row>
        <div style={styles.left}>
          <div style={fieldNameStyle}>From</div>
        </div>
        <div style={{...styles.right, alignItems: 'center'}}>
          <Account
            addr={transaction.get('from')}
            identity
            identityProps={{size: 30}}
            onClick={ () => openAccount(fromAccount) }
          />
        </div>
      </Row>

      <Row>
        <div style={styles.left}>
          <div style={fieldNameStyle}>To</div>
        </div>
        <div style={{...styles.right, alignItems: 'center'}}>
          {transaction.get('to') &&
           <Account
             addr={transaction.get('to')}
             identity
             identityProps={{size: 30}}
             onClick={ () => openAccount(toAccount) }
           />}
        </div>
      </Row>

      <br />
      <br />

      <Row>
        <div style={styles.left}>
          <div style={fieldNameStyle}>Block</div>
        </div>
        <div style={styles.right}>
          { blockNumber ? convert.toNumber(blockNumber) : 'pending' }
        </div>
      </Row>

      <Row>
        <div style={styles.left}>
          <div style={fieldNameStyle}>Input Data</div>
        </div>
        <div style={styles.right}>
          <div className={ classes.txData }>
            <TxInputData data={transaction.get('data')} />
          </div>
        </div>
      </Row>

      <Row>
        <div style={styles.left}>
          <div style={fieldNameStyle}>GAS</div>
        </div>
        <div style={styles.right}>
          {transaction.get('gas') ? transaction.get('gas') : null}
        </div>
      </Row>
      <br />

      <Row style={{marginBottom: 0}}>
        <div style={styles.left}>
        </div>
        <div style={styles.right}>
          <ButtonGroup>
            <Button
              onClick={ () => props.cancel() }
              label="DASHBOARD" />
            <Button
              primary
              onClick={ () => repeatTx(transaction, toAccount, fromAccount) }
              label="REPEAT TRANSACTION" />
          </ButtonGroup>
        </div>
      </Row>
    </Page>
  );
};

TransactionShow.propTypes = {
  transaction: PropTypes.object.isRequired,
  rates: PropTypes.object.isRequired,
  openAccount: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
};

export default connect(
  (state, ownProps): Props => {
    const accounts = state.accounts.get('accounts');
    const account = accounts.find(
      (acct) => acct.get('id') === ownProps.accountId
    );
    const rates = state.wallet.settings.get('rates');
    const currentCurrency = state.wallet.settings.get('localeCurrency');

    const Tx = state.wallet.history.get('trackedTransactions').find(
      (tx) => tx.get('hash') === ownProps.hash
    );
    if (!Tx) {
      log.error("Can't find tx for hash", ownProps.hash);
    }
    const fromAccount = Tx.get('from') ?
      accounts.find((acct) => acct.get('id') === Tx.get('from')) : null;
    const toAccount = Tx.get('to') ?
      accounts.find((acct) => acct.get('id') === Tx.get('to')) : null;

    const showRepeat = !!fromAccount;

    return {
      goBack: ownProps.goBack,
      openAccount: ownProps.openAccount,
      showRepeat,
      repeatTx: ownProps.repeatTx,
      showFiat: launcher.selectors.getChainName(state).toLowerCase() === 'mainnet',
      transaction: Tx,
      account,
      rates,
      currentCurrency,
      fromAccount,
      toAccount,
    };
  },
  (dispatch, ownProps) => ({
    cancel: () => {
      dispatch(gotoScreen('home'));
    },
    goBack: (account) => {
      if (account) {
        dispatch(gotoScreen('account', account));
      } else {
        dispatch(gotoScreen('home'));
      }
    },
    openAccount: (account) => {
      if (account) {
        dispatch(gotoScreen('account', account));
      }
    },
    repeatTx: (transaction, toAccount, fromAccount) => {
      dispatch(gotoScreen('repeat-tx', {transaction, toAccount, fromAccount}));
    },
  })
)(muiThemeable()(TransactionShow));
