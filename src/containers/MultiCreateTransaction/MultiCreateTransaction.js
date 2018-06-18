import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import { Wei, convert } from 'emerald-js';
import { etherToWei } from 'lib/convert';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { CreateTransaction, Page } from 'emerald-js-ui';
import { Back } from 'emerald-js-ui/lib/icons3';
import SignTxForm from '../../components/tx/SendTx/SignTx'
import TransactionShow from '../../components/tx/TxDetails';
import accounts from 'store/vault/accounts';
import { connect } from 'react-redux';
import screen from 'store/wallet/screen';

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
    this.setTransaction('from', from)
  }

  onChangeTo(to) {
    this.setTransaction('to', to)
  }

  onChangeToken(token) {
    this.setTransaction('token', token)
  }

  onChangePassword(password) {
    this.setTransaction('password', password)
  }

  onChangeGasLimit(value) {
    this.setTransaction('gasLimit', value || DEFAULT_GAS_LIMIT)
  }

  onChangeAmount(amount) {
    this.setTransaction('amount', amount || '0')
  }

  componentDidMount() {
    this.setTransaction('token', this.props.tokenSymbols[0]);
    this.setTransaction('gasPrice', this.props.gasPrice);
  }

  onSubmitCreateTransaction() {
    this.setState({
      page: PAGES.PASSWORD,
    });
  }

  onSubmitSignTxForm() {
    this.props.signAndSend(this.state.transaction).then(() => {
      // submit properly
      this.setState({
        page: PAGES.DETAILS,
      });
    });
  }

  getPage() {
    switch (this.state.page) {
      case PAGES.TX:
        return (
          <CreateTransaction
            {...this.state.transaction}
            {...this.props}
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
    const allTokens = state.tokens.get('tokens');
    const balance = new Wei(account.get('balance').value()).getEther().toString();
    const gasPrice = state.network.get('gasPrice');

    const fiatRate = state.wallet.settings.get('localeRate');
    const currency = state.wallet.settings.get('localeCurrency');

    const useLedger = account.get('hardware', false);
    const ledgerConnected = state.ledger.get('connected');

    const addressBookAddresses = state.addressBook.get('addressBook').toJS().map((i) => i.address);
    const ownAddresses = accounts.selectors.getAll(state).toJS().map((i) => i.id);

    const fee = new Wei(gasPrice.mul(DEFAULT_GAS_LIMIT).value()).getEther();
    const tokenSymbols = [{address: '', symbol: 'ETC', name: 'ETC'}].concat(allTokens.toJS()).map((i) => i.name);

    return {
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
    };
  },
  (dispatch, ownProps) => ({
    goDashboard: () => {
      dispatch(screen.actions.gotoScreen('home', ownProps.account));
    },
    signAndSend: (tx) => {
      /* const useLedger = ownProps.account.get('hardware', false);*/

      // TODO: moved tx creation to CreateTransaction handler
      // 1. Create TX here
      /* if (Address.isValid(data.token)) {
       *   // Token TX
       *   const tokenInfo = data.tokens.find((t) => t.get('address') === data.token);
       *   if (!tokenInfo) {
       *     throw new SubmissionError(`Unknown token ${data.token}`);
       *   }

       *   const decimals = convert.toNumber(tokenInfo.get('decimals'));
       *   const tokenUnits: BigNumber = convert.toBaseUnits(convert.toBigNumber(data.value), decimals);
       *   const txData = Tokens.actions.createTokenTxData(
       *     data.to,
       *     tokenUnits,
       *     data.isTransfer);

       *   tx = {
       *     from: data.from,
       *     gasPrice: toHex(data.gasPrice.value()),
       *     gas: toHex(data.gas),
       *     to: data.token,
       *     value: convert.toHex(0),
       *     data: txData,
       *   };
       * } else {*/
        // Ordinary Tx
      /* }*/


      const toAmount = etherToWei(parseFloat(tx.amount).toFixed());
      const gasLimit = new Wei(parseInt(tx.gasLimit, 10)).getValue();
      const gasPrice = new Wei(parseInt(tx.gasPrice, 10)).getValue();

      return dispatch(
        accounts.actions.sendTransaction(
          tx.from,
          tx.password,
          tx.to,
          toHex(gasLimit),
          toHex(gasPrice),
          toHex(toAmount)
        )
      );
    }

      // 2. Validate Trace and then Send TX
      /* return traceValidate(tx, dispatch, network.actions.estimateGas)
       *   .then((estimatedGas) => {
       *     dispatch(ledger.actions.setWatch(false));

       *     return ledger.actions.closeConnection().then(() => {
       *       if (useLedger) {
       *         dispatch(screen.actions.showDialog('sign-transaction', data));
       *       }

       *       return dispatch(
       *         accounts.actions.sendTransaction(
       *           tx.from,
       *           data.password,
       *           tx.to,
       *           tx.gas,
       *           tx.gasPrice,
       *           tx.value,
       *           tx.data)
       *       );
       *     });
       *   })
       *   .then(() => {
       *     dispatch(reset('createTx'));
       *   })
       *   .catch((err) => {
       *     throw new SubmissionError({ _error: (err.message || JSON.stringify(err)) });
       *   });*/
  }))(MultiCreateTransaction);
