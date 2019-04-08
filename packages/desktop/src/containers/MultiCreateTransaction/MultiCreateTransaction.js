import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import Tokens from 'store/vault/tokens';
import { fromJS } from 'immutable';
import { CreateTx, SignTx } from '@emeraldwallet/ui';
import { Wei } from '@emeraldplatform/emerald-js';
import { convert, toBaseUnits } from '@emeraldplatform/core';
import { etherToWei } from 'lib/convert';
import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { connect } from 'react-redux';
import accounts from 'store/vault/accounts';
import network from 'store/network';
import screen from 'store/wallet/screen';
import ledger from 'store/ledger/';
import Wallet from 'store/wallet';
import TransactionShow from '../../components/tx/TxDetails';
import { txFee, txFeeFiat, traceValidate } from './util';

const { toHex } = convert;

const PAGES = {
  TX: 1,
  SIGN: 2,
  DETAILS: 3,
};

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
    data: PropTypes.object,
    mode: PropTypes.string,
    typedData: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.onChangeFrom = this.onChangeFrom.bind(this);
    this.onChangeTo = this.onChangeTo.bind(this);
    this.onChangeToken = this.onChangeToken.bind(this);
    this.onChangeGasLimit = this.onChangeGasLimit.bind(this);
    this.onSubmitCreateTransaction = this.onSubmitCreateTransaction.bind(this);
    this.onSubmitSignTxForm = this.onSubmitSignTxForm.bind(this);
    this.onChangeAmount = this.onChangeAmount.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.getPage = this.getPage.bind(this);
    this.onMaxClicked = this.onMaxClicked.bind(this);
    this.state = {
      transaction: {},
      page: props.mode ? PAGES.PASSWORD : PAGES.TX,
    };
  }

  get balance() {
    return this.props.getBalanceForAddress(this.state.transaction.from, this.state.transaction.token);
  }

  setTransaction(key, val) {
    this.setState({
      transaction: {
        ...this.state.transaction,
        [key]: val,
      },
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
    this.setTransaction('amount', amount);
  }

  componentDidUpdate(prevProps) {
    const {
      from, to, value, data,
    } = prevProps;
    const props = this.props; // eslint-disable-line
    if (from !== props.from || to !== props.to || value !== props.value || data !== props.data) {
      this.setState({
        page: props.mode ? PAGES.PASSWORD : PAGES.TX,
        transaction: {
          ...this.state.transaction,
          from: this.props.selectedFromAccount,
          token: this.props.tokenSymbols[0],
          gasPrice: this.props.gasPrice,
          amount: this.props.amount,
          to: this.props.to,
          gasLimit: this.props.gasLimit,
          data: this.props.data,
          typedData: this.props.typedData,
        },
      });
    }
  }

  componentDidMount() {
    this.setState({
      transaction: {
        ...this.state.transaction,
        from: this.props.selectedFromAccount,
        token: this.props.tokenSymbols[0],
        gasPrice: this.props.gasPrice,
        amount: this.props.amount,
        to: this.props.to,
        gasLimit: this.props.gasLimit,
        data: this.props.data,
        typedData: this.props.typedData,
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
      allTokens: this.props.allTokens,
    });
  }

  onMaxClicked() {
    const fee = this.props.getTxFeeForGasLimit(this.state.transaction.gasLimit);
    const amount = this.balance.sub(fee);
    this.setTransaction('amount', amount);
  }

  getPage() {
    if (!this.state.transaction.from) { return null; }

    switch (this.state.page) {
      case PAGES.TX:
        return (
          <CreateTx
            to={this.state.transaction.to}
            from={this.state.transaction.from}
            txFeeSymbol={this.props.txFeeSymbol}
            token={this.state.transaction.token}
            amount={this.state.transaction.amount.getEther(6)}
            gasLimit={this.state.transaction.gasLimit}
            txFee={this.props.getTxFeeForGasLimit(this.state.transaction.gasLimit).getEther(6)}
            txFeeFiat={this.props.getTxFeeFiatForGasLimit(this.state.transaction.gasLimit)}

            balance={this.props.getBalanceForAddress(this.state.transaction.from, this.state.transaction.token).getEther(6)}
            fiatBalance={this.props.getFiatForAddress(this.state.transaction.from, this.state.transaction.token)}
            data={this.state.transaction.data}
            typedData={this.state.transaction.typedData}
            currency={this.props.currency}
            tokenSymbols={this.props.tokenSymbols}
            addressBookAddresses={this.props.addressBookAddresses}
            ownAddresses={this.props.ownAddresses}

            onChangeFrom={this.onChangeFrom}
            onChangeToken={this.onChangeToken}
            onChangeGasLimit={this.onChangeGasLimit}
            onChangeAmount={this.onChangeAmount}
            onChangeTo={this.onChangeTo}
            onSubmit={this.onSubmitCreateTransaction}
            onCancel={this.props.onCancel}
            onEmptyAddressBookClick={this.props.onEmptyAddressBookClick}
            onMaxClicked={this.onMaxClicked}
          />
        );
      case PAGES.PASSWORD:
        return (
          <SignTx
            fiatRate={this.props.fiateRate}
            tx={this.state.transaction}
            txFee={this.props.getTxFeeForGasLimit(this.state.transaction.gasLimit).getEther(6)}
            onChangePassword={this.onChangePassword}
            useLedger={this.props.useLedger}
            typedData={this.state.transaction.typedData}
            onSubmit={this.onSubmitSignTxForm}
            mode={this.props.mode}
            onCancel={this.props.onCancel}
          />
        );
      case PAGES.DETAILS:
        return (
          <TransactionShow hash={this.state.transaction.hash} accountId={this.state.transaction.from}/>
        );
      default: return null;
    }
  }

  render() {
    return (
      <Page title="Create Transaction" leftIcon={<Back onClick={this.props.onCancel}/>}>
        {this.getPage()}
      </Page>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const { account } = ownProps;
    const blockchain = Wallet.selectors.currentBlockchain(state);
    const txFeeSymbol = (blockchain && blockchain.params.coinTicker) || '';
    const allTokens = state.tokens.get('tokens').concat([fromJS({address: '', symbol: txFeeSymbol, name: txFeeSymbol})]).reverse();
    const gasPrice = network.selectors.gasPrice(state);

    const fiatRate = state.wallet.settings.get('localeRate');
    const currency = state.wallet.settings.get('localeCurrency');

    const useLedger = account.get('hardware', false);
    const ledgerConnected = state.ledger.get('connected');

    const addressBookAddresses = state.addressBook.get('addressBook').toJS().map((i) => i.address);
    const ownAddresses = accounts.selectors.getAll(state).toJS().map((i) => i.id);

    const tokenSymbols = allTokens.toJS().map((i) => i.symbol);

    return {
      amount: new Wei(ownProps.amount || '0'),
      gasLimit: ownProps.gasLimit || DEFAULT_GAS_LIMIT,
      typedData: ownProps.typedData,
      token: txFeeSymbol,
      txFeeSymbol,
      data: ownProps.data,
      selectedFromAccount: account.get('id'),
      getBalanceForAddress: (address, token) => {
        return Wallet.selectors.balanceWei(state, address, token);
      },
      getFiatForAddress: (address, token) => {
        if (token !== txFeeSymbol) { return '??'; }
        const selectedAccount = state.accounts.get('accounts').find((acnt) => acnt.get('id') === address);
        const newBalance = selectedAccount.get('balance');
        return newBalance.getFiat(fiatRate).toString();
      },
      getTxFeeForGasLimit: (gasLimit) => txFee(gasPrice, gasLimit),
      getTxFeeFiatForGasLimit: (gasLimit) => txFeeFiat(gasPrice, gasLimit, fiatRate),
      currency,
      gasPrice,
      tokenSymbols,
      addressBookAddresses,
      ownAddresses,
      useLedger,
      ledgerConnected,
      allTokens,
    };
  },
  (dispatch, ownProps) => ({
    onCancel: () => dispatch(screen.actions.gotoScreen('home', ownProps.account)),
    onEmptyAddressBookClick: () => dispatch(screen.actions.gotoScreen('add-address')),
    signAndSend: ({transaction, allTokens}) => {
      const useLedger = ownProps.account.get('hardware', false);

      const tokenInfo = allTokens.find((t) => t.get('symbol') === transaction.token);

      const toAmount = transaction.amount.value().toString();

      const gasLimit = new Wei(transaction.gasLimit).getValue();
      const gasPrice = transaction.gasPrice.toString();

      if (transaction.data) {
        return dispatch(
          accounts.actions.sendTransaction(
            transaction.from,
            transaction.password,
            transaction.to,
            toHex(gasLimit),
            toHex(gasPrice),
            convert.toHex(toAmount || 0),
            transaction.data
          )
        );
      }

      // TODO: refactor this check
      if ((transaction.token !== 'ETC') && (transaction.token !== 'ETH')) {
        const decimals = convert.toNumber(tokenInfo.get('decimals'));
        const tokenUnits = toBaseUnits(convert.toBigNumber(transaction.amount), decimals || 18);
        const txData = Tokens.actions.createTokenTxData(
          transaction.to,
          tokenUnits,
          'true'
        );
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
        password: transaction.password !== '' ? transaction.password : null,
        to: transaction.to,
        gas: toHex(gasLimit),
        gasPrice: toHex(gasPrice),
        value: toHex(toAmount),
      }, dispatch, network.actions.estimateGas)
        .then(() => dispatch(ledger.actions.setWatch(false)))
        .then(() => dispatch(ledger.actions.setConnected(false)))
        .then(() => ledger.actions.closeConnection())
        .then(() => (useLedger ? dispatch(screen.actions.showDialog('sign-transaction', transaction)) : null))
        .then(() => {
          return dispatch(
            accounts.actions.sendTransaction(
              transaction.from,
              transaction.password !== '' ? transaction.password : null,
              transaction.to,
              toHex(gasLimit),
              toHex(gasPrice),
              toHex(toAmount)
            )
          );
        });
    },
  })
)(MultiCreateTransaction);
