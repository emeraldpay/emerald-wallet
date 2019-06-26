import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import { Wei, Units } from '@emeraldplatform/eth';
import { convert, toBaseUnits } from '@emeraldplatform/core';
import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import {Blockchains} from '@emeraldwallet/core';
import { CreateEthereumTx, TxTarget, ValidationResult } from '@emeraldwallet/workflow';
import { CreateTx, SignTx } from '@emeraldwallet/ui';
import Tokens from '../../store/vault/tokens';
import accounts from '../../store/vault/accounts';
import network from '../../store/network';
import { screen, addresses, blockchains } from '../../store';
import ledger from '../../store/ledger';
import Wallet from '../../store/wallet';
import TransactionShow from '../../components/tx/TxDetails';
import { txFeeFiat, traceValidate } from './util';

const PAGES = {
  TX: 1,
  SIGN: 2,
  DETAILS: 3,
};

const DEFAULT_GAS_LIMIT = '21000';


class MultiCreateTransaction extends React.Component {
  static propTypes = {
    currency: PropTypes.string.isRequired,
    balance: PropTypes.object.isRequired,
    fiatBalance: PropTypes.string.isRequired,
    tokenSymbols: PropTypes.arrayOf(PropTypes.string).isRequired,
    addressBookAddresses: PropTypes.arrayOf(PropTypes.string).isRequired,
    ownAddresses: PropTypes.arrayOf(PropTypes.string).isRequired,
    accountAddress: PropTypes.string,
    txFee: PropTypes.object.isRequired,
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
    const tx = MultiCreateTransaction.txFromProps(props);
    this.state = {
      transaction: tx.dump(),
      page: props.mode ? PAGES.PASSWORD : PAGES.TX,
    };
  }

  get balance() {
    return this.props.getBalanceForAddress(this.state.transaction.from, this.state.token);
  }

  get transaction() {
    return CreateEthereumTx.fromPlain(this.state.transaction);
  }

  set transaction(tx) {
    this.setState({transaction: tx.dump()});
  }

  onChangeFrom(from) {
    const tx = this.transaction;
    const balance = this.props.getBalanceForAddress(from, this.state.token);
    tx.setFrom(from, balance);
    this.transaction = tx;
  }

  onChangeTo(to) {
    const tx = this.transaction;
    tx.to = to;
    this.transaction = tx;
  }

  onChangeToken(token) {
    this.setState({token});
  }

  onChangePassword(password) {
    this.setState({password});
  }

  onChangeGasLimit(value) {
    const tx = this.transaction;
    tx.gas = new BigNumber(value || DEFAULT_GAS_LIMIT);
    this.transaction = tx;
  }

  /**
   * @param amount Wei class
   */
  onChangeAmount(amount) {
    // TODO check if Wei instance
    if (typeof amount !== 'object') {
      return;
    }
    const tx = this.transaction;
    tx.amount = amount;
    tx.target = TxTarget.MANUAL;
    this.transaction = tx;
  }

  static txFromProps(props) {
    const tx = new CreateEthereumTx();
    tx.from = props.selectedFromAccount;
    tx.totalBalance = props.balance || props.getBalanceForAddress(tx.from, props.token);
    tx.gasPrice = props.gasPrice;
    tx.amount = props.amount;
    tx.gas = new BigNumber(props.gasLimit || DEFAULT_GAS_LIMIT);
    return tx;
  }

  componentDidUpdate(prevProps) {
    const {
      from, to, value, data,
    } = prevProps;
    const props = this.props; // eslint-disable-line
    if (from !== props.from || to !== props.to || value !== props.value || data !== props.data) {
      this.setState({
        page: props.mode ? PAGES.PASSWORD : PAGES.TX,
        token: this.props.tokenSymbols[0],
        data: this.props.data,
        typedData: this.props.typedData,
        transaction: MultiCreateTransaction.txFromProps(this.props).dump(),
      });
    }
  }

  componentDidMount() {
    this.setState({
      amount: this.props.amount,
      data: this.props.data,
      typedData: this.props.typedData,
      token: this.props.tokenSymbols[0],
      transaction: MultiCreateTransaction.txFromProps(this.props).dump(),
    });
  }

  onSubmitCreateTransaction() {
    this.setState({
      page: PAGES.PASSWORD,
    });
  }

  onSubmitSignTxForm() {
    this.props.signAndSend({
      transaction: this.transaction,
      password: this.state.password,
      data: this.state.data,
      allTokens: this.props.allTokens,
      token: this.state.token,
    });
  }

  onMaxClicked() {
    const tx = this.transaction;
    tx.target = TxTarget.SEND_ALL;
    tx.rebalance();
    this.transaction = tx;
  }

  getPage() {
    if (!this.state.transaction.from) { return null; }
    const tx = this.transaction;
    switch (this.state.page) {
      case PAGES.TX:
        return (
          <CreateTx
            tx={tx}
            txFeeToken={this.props.txFeeSymbol}
            token={this.state.token}
            txFeeFiat={this.props.getTxFeeFiatForGasLimit(tx.gas.toNumber())}

            fiatBalance={this.props.getFiatForAddress(tx.from, this.state.token)}
            data={this.state.data}
            typedData={this.state.typedData}
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
            fiatRate={this.props.fiatRate}
            token={this.state.token}
            tx={tx}
            txFeeCurrency={this.props.txFeeSymbol}
            onChangePassword={this.onChangePassword}
            useLedger={this.props.useLedger}
            typedData={this.state.typedData}
            onSubmit={this.onSubmitSignTxForm}
            mode={this.props.mode}
            onCancel={this.props.onCancel}
          />
        );
      case PAGES.DETAILS:
        return (
          <TransactionShow hash={this.state.hash} accountId={this.state.transaction.from}/>
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

function signAndSendToken(dispatch, ownProps, args) {
  const {
    transaction, password, token, allTokens,
  } = args;
  const chain = ownProps.account.get('blockchain');
  const tokenInfo = allTokens.find((t) => t.get('symbol') === token);
  const decimals = convert.toNumber(tokenInfo.get('decimals'));
  const tokenUnits = toBaseUnits(convert.toBigNumber(transaction.amount), decimals || 18);
  const txData = Tokens.actions.createTokenTxData(
    transaction.to,
    tokenUnits,
    'true'
  );
  return dispatch(
    accounts.actions.sendTransaction(
      chain,
      transaction.from,
      password,
      tokenInfo.get('address'),
      transaction.gas,
      transaction.gasPrice,
      Wei.ZERO,
      txData
    )
  );
}

function signAndSendEther(dispatch, ownProps, {transaction, password}) {
  const chain = ownProps.account.get('blockchain');
  const useLedger = ownProps.account.get('hardware', false);

  const plainTx = {
    password,
    from: transaction.from,
    to: transaction.to,
    gas: transaction.gas,
    gasPrice: transaction.gasPrice,
    value: transaction.amount,
  };

  return traceValidate(chain, plainTx, dispatch, network.actions.estimateGas)
    .then(() => dispatch(ledger.actions.setWatch(false)))
    .then(() => dispatch(ledger.actions.setConnected(false)))
    .then(() => ledger.actions.closeConnection())
    .then(() => (useLedger ? dispatch(screen.actions.showDialog('sign-transaction', transaction)) : null))
    .then(() => {
      return dispatch(
        accounts.actions.sendTransaction(
          chain,
          transaction.from,
          password,
          transaction.to,
          transaction.gas,
          transaction.gasPrice,
          transaction.amount
        )
      );
    });
}

function signAndSend(dispatch, ownProps, args) {
  // TODO: refactor this check
  const token = args.token.toUpperCase();
  if ((token !== 'ETC') && (token !== 'ETH')) {
    return signAndSendToken(dispatch, ownProps, args);
  }
  return signAndSendEther(dispatch, ownProps, args);
}

export default connect(
  (state, ownProps) => {
    const { account } = ownProps;
    const chain = account.get('blockchain');
    const blockchain = Blockchains[chain.toLowerCase()];
    const txFeeSymbol = (blockchain && blockchain.params.coinTicker) || '';
    const allTokens = state.tokens.get('tokens').concat([fromJS({address: '', symbol: txFeeSymbol, name: txFeeSymbol})]).reverse();
    const gasPrice = blockchains.selectors.gasPrice(state, chain);
    const fiatRate = state.wallet.settings.get('localeRate');

    return {
      amount: ownProps.amount || Wei.ZERO,
      gasLimit: ownProps.gasLimit || DEFAULT_GAS_LIMIT,
      typedData: ownProps.typedData,
      token: txFeeSymbol,
      txFeeSymbol: txFeeSymbol,
      data: ownProps.data,
      selectedFromAccount: account.get('id'),
      getBalanceForAddress: (address, token) => {
        return Wallet.selectors.balanceWei(state, chain, address, token);
      },
      getFiatForAddress: (address, token) => {
        if (token !== txFeeSymbol) { return '??'; }
        const selectedAccount = addresses.selectors.find(state, address, chain);
        const newBalance = selectedAccount.get('balance');
        return newBalance.getFiat(fiatRate).toString();
      },
      getTxFeeFiatForGasLimit: (gasLimit) => txFeeFiat(gasPrice, gasLimit, fiatRate),
      currency: state.wallet.settings.get('localeCurrency'),
      gasPrice: gasPrice,
      tokenSymbols: allTokens.toJS().map((i) => i.symbol),
      addressBookAddresses: state.addressBook.get('addressBook').toJS().map((i) => i.address),
      ownAddresses: addresses.selectors.all(state).toJS().map((i) => i.id),
      useLedger: account.get('hardware', false),
      ledgerConnected: state.ledger.get('connected'),
      allTokens: allTokens,
    };
  },

  (dispatch, ownProps) => ({
    onCancel: () => dispatch(screen.actions.gotoScreen('home', ownProps.account)),
    onEmptyAddressBookClick: () => dispatch(screen.actions.gotoScreen('add-address')),
    signAndSend: (args) => signAndSend(dispatch, ownProps, args),
  })

)(MultiCreateTransaction);
