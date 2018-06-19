import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import Tokens from 'store/vault/tokens';
import { fromJS } from 'immutable';
import { Address, Wei, convert } from 'emerald-js';
import { etherToWei } from 'lib/convert';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { CreateTransaction, Page } from 'emerald-js-ui';
import { Back } from 'emerald-js-ui/lib/icons3';
import SignTxForm from '../../components/tx/SendTx/SignTx'
import TransactionShow from '../../components/tx/TxDetails';
import accounts from 'store/vault/accounts';
import { connect } from 'react-redux';
import screen from 'store/wallet/screen';
import { traceValidate } from '../../components/tx/SendTx/utils';
import network from 'store/network';
import ledger from 'store/ledger/';

const { toHex } = convert;

const PAGES = {
  TX: 1,
  SIGN: 2,
  DETAILS: 3
}

const DEFAULT_GAS_LIMIT = '21000';

class MultiCreateTransaction extends React.Component {
  static propTypes = {
    currency: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired,
    fiatBalance: PropTypes.string.isRequired,
    tokenSymbols: PropTypes.arrayOf(PropTypes.string).isRequired,
    addressBookAddresses: PropTypes.arrayOf(PropTypes.string).isRequired,
    ownAddresses: PropTypes.arrayOf(PropTypes.string).isRequired,
    accountAddress: PropTypes.string,
    txFee: PropTypes.string.isRequired,
    txFeeFiat: PropTypes.string.isRequired,
  };

  constructor() {
    super();
    this.onChangeFrom = this.onChangeFrom.bind(this);
    this.onChangeTo = this.onChangeTo.bind(this);
    this.onChangeToken = this.onChangeToken.bind(this);
    this.onChangeGasLimit = this.onChangeGasLimit.bind(this);
    this.onSubmitCreateTransaction = this.onSubmitCreateTransaction.bind(this);
    this.onSubmitSignTxForm = this.onSubmitSignTxForm.bind(this);
    this.onChangeAmount = this.onChangeAmount.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.getPage = this.getPage.bind(this);
    this.state = {
      transaction: {
        gasLimit: DEFAULT_GAS_LIMIT,
        amount: '0',
      },
      page: PAGES.TX
    };
  }

  setTransaction(key, val) {
    this.setState({
      transaction: {
        ...this.state.transaction,
        [key]: val
      }
    });
  }

  onChangeFrom(from) {
    this.setTransaction('from', from);
  }

  onChangeTo(to) {
    this.setTransaction('to', to);
  }

  onChangeToken(token) {
    this.setTransaction('token', token);
  }

  onChangePassword(password) {
    this.setTransaction('password', password);
  }

  onChangeGasLimit(value) {
    this.setTransaction('gasLimit', value || DEFAULT_GAS_LIMIT);
  }

  onChangeAmount(amount) {
    this.setTransaction('amount', amount || '0');
  }

  componentDidMount() {
    this.setState({
      transaction: {
        ...this.state.transaction,
        from: this.props.accountAddress,
        token: this.props.tokenSymbols[0],
        gasPrice: this.props.gasPrice,
        amount: this.props.amount,
        to: this.props.to,
        gasLimit: this.props.gasLimit,
      },
    });
  }

  onSubmitCreateTransaction() {
    this.setState({
      page: PAGES.PASSWORD,
    });
  }

  onSubmitSignTxForm() {
    this.props.signAndSend({
      transaction: this.state.transaction,
      allTokens: this.props.allTokens
    })
  }

  getPage() {
    switch (this.state.page) {
      case PAGES.TX:
        return (
          <CreateTransaction
            {...this.props}
            {...this.state.transaction}
            onChangeFrom={this.onChangeFrom}
            onChangeToken={this.onChangeToken}
            onChangeGasLimit={this.onChangeGasLimit}
            onChangeAmount={this.onChangeAmount}
            onChangeTo={this.onChangeTo}
            onSubmit={this.onSubmitCreateTransaction}
            />
        )
      case PAGES.PASSWORD:
        return (
          <SignTxForm
            tx={this.state.transaction}
            onChangePassword={this.onChangePassword}
            useLedger={this.props.useLedger}
            onSubmit={this.onSubmitSignTxForm}
          />
        )
      case PAGES.DETAILS:
        return (
          <TransactionShow hash={this.state.transaction.hash} accountId={this.state.transaction.from}/>
        )
      default: return null
    }
  }

  render() {
    return (
      <Page title="Create Transaction" leftIcon={<Back onClick={this.props.goDashboard}/>}>
        {this.getPage()}
      </Page>
    )
  }
}

const ThemedCreateTransaction = muiThemeable()(MultiCreateTransaction);

export default connect(
  (state, ownProps) => {
    const account = ownProps.account;
    const allTokens = state.tokens.get('tokens').concat([fromJS({address: '', symbol: 'ETC', name: 'ETC'})]).reverse();
    const balance = new Wei(account.get('balance').value()).getEther().toString();
    const gasPrice = state.network.get('gasPrice');

    const fiatRate = state.wallet.settings.get('localeRate');
    const currency = state.wallet.settings.get('localeCurrency');

    const useLedger = account.get('hardware', false);
    const ledgerConnected = state.ledger.get('connected');

    const addressBookAddresses = state.addressBook.get('addressBook').toJS().map((i) => i.address);
    const ownAddresses = accounts.selectors.getAll(state).toJS().map((i) => i.id);

    const fee = new Wei(gasPrice.mul(DEFAULT_GAS_LIMIT).value()).getEther();
    const tokenSymbols = allTokens.toJS().map((i) => i.name);

    return {
      accountAddress: account.get('id'),
      currency,
      balance,
      gasPrice,
      fiatBalance: (fiatRate * balance).toFixed(),
      tokenSymbols,
      addressBookAddresses,
      ownAddresses,
      txFee: fee.toString(),
      txFeeFiat: fee * fiatRate,
      useLedger,
      ledgerConnected,
      allTokens
    };
  },
  (dispatch, ownProps) => ({
    goDashboard: () => {
      dispatch(screen.actions.gotoScreen('home', ownProps.account));
    },
    signAndSend: ({transaction, allTokens}) => {
      const useLedger = ownProps.account.get('hardware', false);

      const tokenInfo = allTokens.find((t) => t.get('name') === transaction.token);

      const toAmount = etherToWei(parseFloat(transaction.amount).toFixed());
      const gasLimit = new Wei(parseInt(transaction.gasLimit, 10)).getValue();
      const gasPrice = new Wei(parseInt(transaction.gasPrice, 10)).getValue();

      if (!tokenInfo) {
        throw new SubmissionError(`Unknown token ${data.token}`);
      }
      // TODO: moved tx creation to CreateTransaction handler
      // 1. Create TX here
      if (Address.isValid(tokenInfo.get('address'))) {
        const decimals = convert.toNumber(tokenInfo.get('decimals'));
        const tokenUnits: BigNumber = convert.toBaseUnits(convert.toBigNumber(transaction.amount), decimals || 18);
        const txData = Tokens.actions.createTokenTxData(
          transaction.to,
          tokenUnits,
          'true');
        return dispatch(
          accounts.actions.sendTransaction(
            transaction.from,
            transaction.password,
            tokenInfo.get('address'),
            toHex(gasLimit),
            toHex(gasPrice),
            convert.toHex(0),
            txData
          )
        );
      }

      return traceValidate({
        from: transaction.from,
        to: transaction.to,
        gas: toHex(gasLimit),
        gasPricce: toHex(gasPrice),
        value: toHex(toAmount)
      }, dispatch, network.actions.estimateGas).then((estimateGas) => {
        dispatch(ledger.actions.setWatch(false));

        return ledger.actions.closeConnection().then(() => {
          if (useLedger) {
            dispatch(screen.actions.showDialog('sign-transaction', transaction));
          }
          return dispatch(
            accounts.actions.sendTransaction(
              transaction.from,
              transaction.password,
              transaction.to,
              toHex(gasLimit),
              toHex(gasPrice),
              toHex(toAmount)
            )
          );
        })
      });
    }
  }))(MultiCreateTransaction);
