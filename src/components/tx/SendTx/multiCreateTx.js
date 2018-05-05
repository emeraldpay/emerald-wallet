// @flow
import BigNumber from 'bignumber.js';
import DashboardButton from 'components/common/DashboardButton';
import { Address, Wei, convert } from 'emerald-js';
import Immutable from 'immutable';
import { etherToWei } from 'lib/convert';
import TokenUnits from 'lib/tokenUnits';
import muiThemeable from 'material-ui/styles/muiThemeable';
import React from 'react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { SubmissionError, formValueSelector, reset } from 'redux-form';
import launcher from 'store/launcher';
import ledger from 'store/ledger/';
import network from 'store/network';
import accounts from 'store/vault/accounts';
import Tokens from 'store/vault/tokens';
import screen from 'store/wallet/screen';
import TransactionShow from '../TxDetails';
import SignTx from './SignTx';
import CreateTx from './CreateTx';
import { traceValidate } from './utils';

const { toHex } = convert;

const DefaultGas = 21000;
const DefaultTokenGas = 23890;

const selector = formValueSelector('createTx');
const getGasPrice = (state) => state.network.get('gasPrice');

export const selectBalance = (state, account) => {
  if (!account.get('balance')) {
    return {
      symbol: 'ETC',
    };
  }
  const tokens = state.tokens.get('tokens');
  const token = selector(state, 'token');
  if (Address.isValid(token)) {
    const tokenInfo = tokens.find((t) => t.get('address') === token);
    let tokenBalance = Tokens.selectors.balanceByAddress(state.tokens, token, account.get('id'));
    if (!tokenBalance) {
      tokenBalance = new TokenUnits(0, tokenInfo.get('decimals'));
    }
    return {
      symbol: tokenInfo.get('symbol'),
      value: tokenBalance,
    };
  }
  return {
    symbol: 'ETC',
    value: new TokenUnits(account.get('balance').value(), 18),
  };
};

const PAGES = {
  TX: 1,
  PASSWORD: 2,
  DETAILS: 3,
};

const breadCrumbStyles = {
  paddingLeft: '20px',
  paddingRight: '10px',
  paddingTop: '5px',
  fontSize: '18px',
  fontWeight: '400',
};

class MultiPageCreateTx extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      page: PAGES.TX,
      accountId: '',
    };
    this.getPage = this.getPage.bind(this);
  }

  // nextPage = () => {
  //   this.setState({ page: this.state.page + 1 });
  // }

  onCreateTransaction = (data, nativeTx, tx) => {
    // Store both tx in state to pass it to Sign form
    this.setState({ tx, nativeTx, page: PAGES.PASSWORD });
  }

  getPage() {
    const { page, tx, nativeTx } = this.state;
    const { t, backLabel } = this.props;
    switch (page) {
      case PAGES.TX:
        return (<CreateTx {...this.props} onCreateTransaction={this.onCreateTransaction} />);
      case PAGES.PASSWORD:
        return (<SignTx tx={tx} nativeTx={nativeTx} onSubmit={this.props.signAndSend} {...this.props} />);
      case PAGES.DETAILS:
        return (<TransactionShow hash={ this.props.hash } accountId={ this.props.accountId }/>);
      default: return null;
    }
  }

  render() {
    const { page, privateKey, accountId } = this.state;
    const { t, backLabel, muiTheme, goDashboard } = this.props;
    if (!page) { return null; }
    return (
      <div style={{border: `1px solid ${muiTheme.palette.borderColor}`, background: muiTheme.palette.alternateTextColor}} >
        <div style={{display: 'flex', padding: '20px', paddingTop: '41px'}}>
          <div style={{paddingRight: '10px'}}><DashboardButton onClick={ goDashboard }/></div>
          <div style={{color: this.state.page === PAGES.TX ? null : muiTheme.palette.secondaryTextColor, ...breadCrumbStyles}}>Create Transaction</div>
          <div style={{color: this.state.page === PAGES.PASSWORD ? null : muiTheme.palette.secondaryTextColor, ...breadCrumbStyles}}>Send Transaction</div>
          <div style={{color: this.state.page === PAGES.DETAILS ? null : muiTheme.palette.secondaryTextColor, ...breadCrumbStyles}}>Transaction Details</div>
        </div>
        {this.getPage()}
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const fromAddr = (selector(state, 'from') ? selector(state, 'from') : ownProps.account.get('id'));
    const account = accounts.selectors.selectAccount(state, fromAddr);
    const allTokens = state.tokens.get('tokens');
    const balance = selectBalance(state, account);
    const gasPrice = getGasPrice(state);

    const fiatRate = state.wallet.settings.get('localeRate');
    const fiatCurrency = state.wallet.settings.get('localeCurrency');

    const useLedger = account.get('hardware', false);
    const ledgerConnected = state.ledger.get('connected');

    const gasLimit = selector(state, 'gas') ? new BigNumber(selector(state, 'gas')) : new BigNumber(DefaultGas);

    let value = (selector(state, 'value')) ? selector(state, 'value') : 0;
    let to;
    // Transaction is passed in if this is a repeat transaction
    if (ownProps.transaction) {
      if (ownProps.toAccount === undefined) to = ownProps.transaction.get('to');
      else to = ownProps.toAccount.get('id');

      value = new Wei(ownProps.transaction.get('value')).getEther();
    } else {
      to = selector(state, 'to');
    }

    const fee = new TokenUnits(gasPrice.mul(gasLimit).value(), 18);

    return {
      initialValues: {
        gasPrice,
        fee,
        to,
        from: selector(state, 'from') || ownProps.account.get('id'),
        gas: DefaultGas,
        token: '',
        isTransfer: 'true',
        tokens: allTokens,
        value,
      },
      to,
      from: selector(state, 'from') || ownProps.account.get('id'),
      showFiat: launcher.selectors.getChainName(state).toLowerCase() === 'mainnet',
      accounts: accounts.selectors.getAll(state, Immutable.List()),
      tokens: allTokens.unshift(Immutable.fromJS({ address: '', symbol: 'ETC' })),
      isToken: Address.isValid(selector(state, 'token')),
      fiatRate,
      fiatCurrency,
      value,
      balance,
      fromAddr,
      useLedger,
      ledgerConnected,
      fee,
    };
  },
  (dispatch, ownProps) => ({
    goDashboard: () => {
      dispatch(reset('createTx'));
      dispatch(screen.actions.gotoScreen('home', ownProps.account));
    },
    signAndSend: (data) => {
      const useLedger = ownProps.account.get('hardware', false);

      // TODO: moved tx creation to CreatTransation handler
      let tx;
      // 1. Create TX here
      if (Address.isValid(data.token)) {
        // Token TX
        const tokenInfo = data.tokens.find((t) => t.get('address') === data.token);
        if (!tokenInfo) {
          throw new SubmissionError(`Unknown token ${data.token}`);
        }

        const decimals = convert.toNumber(tokenInfo.get('decimals'));
        const tokenUnits: BigNumber = convert.toBaseUnits(convert.toBigNumber(data.value), decimals);
        const txData = Tokens.actions.createTokenTxData(
          data.to,
          tokenUnits,
          data.isTransfer);

        tx = {
          from: data.from,
          gasPrice: toHex(data.gasPrice.value()),
          gas: toHex(data.gas),
          to: data.token,
          value: convert.toHex(0),
          data: txData,
        };
      } else {
        // Ordinary Tx
        tx = {
          from: data.from,
          gasPrice: toHex(data.gasPrice.value()),
          gas: toHex(data.gas),
          to: data.to,
          value: toHex(etherToWei(data.value)),
        };
      }

      // 2. Validate Trace and then Send TX
      return traceValidate(tx, dispatch, network.actions.estimateGas)
        .then((estimatedGas) => {
          dispatch(ledger.actions.setWatch(false));

          return ledger.actions.closeConnection().then(() => {
            if (useLedger) {
              dispatch(screen.actions.showDialog('sign-transaction', data));
            }

            return dispatch(
              accounts.actions.sendTransaction(
                tx.from,
                data.password,
                tx.to,
                tx.gas,
                tx.gasPrice,
                tx.value,
                tx.data)
            );
          });
        })
        .then(() => {
          dispatch(reset('createTx'));
        })
        .catch((err) => {
          throw new SubmissionError({ _error: (err.message || JSON.stringify(err)) });
        });
    },
  }))(translate('createtx')(muiThemeable()(MultiPageCreateTx)));
