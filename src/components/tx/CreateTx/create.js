// @flow
import Immutable from 'immutable';
import BigNumber from 'bignumber.js';
import { change, formValueSelector, SubmissionError } from 'redux-form';
import { convert, Address, Wei } from 'emerald-js';
import { connect } from 'react-redux';
import ledger from 'store/ledger/';
import { etherToWei } from 'lib/convert';
import { address } from 'lib/validators';
import launcher from 'store/launcher';
import network from 'store/network';
import accounts from 'store/vault/accounts';
import Tokens from 'store/vault/tokens';
import screen from 'store/wallet/screen';
import TokenUnits from 'lib/tokenUnits';
import CreateTxForm from './createTxForm';
import createLogger from '../../../utils/logger';

const log = createLogger('CreateTx');

const DefaultGas = 21000;
const DefaultTokenGas = 23890;

const { toHex } = convert;

export const traceValidate = (tx, dispatch, estimateGas): Promise<number> => {
  return new Promise((resolve, reject) => {
    dispatch(estimateGas(tx.from, tx.to, tx.gas, tx.gasPrice, tx.value, tx.data))
      .then((gasEst) => {
        if (!gasEst) {
          reject('Invalid Transaction');
        } else if (gasEst > convert.toNumber(tx.gas)) {
          reject(`Insufficient Gas. Expected ${gasEst}`);
        } else {
          resolve(gasEst);
        }
      }).catch((error) => reject(error));
  });
};

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


const CreateTx = connect(
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
    }

    const fee = new TokenUnits(gasPrice.mul(gasLimit).value(), 18);

    return {
      initialValues: {
        gasPrice,
        fee,
        to,
        from: ownProps.account.get('id'),
        gas: DefaultGas,
        token: '',
        isTransfer: 'true',
        tokens: allTokens,
        value,
      },
      showFiat: launcher.selectors.getChainName(state).toLowerCase() === 'mainnet',
      accounts: accounts.selectors.getAll(state, Immutable.List()),
      addressBook: state.addressBook.get('addressBook'),
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
    onSubmit: (data) => {
      const useLedger = ownProps.account.get('hardware', false);

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

      log.debug(JSON.stringify(tx));


      // 2. Validate Trace and then Send TX
      return traceValidate(tx, dispatch, network.actions.estimateGas)
        .then((estimatedGas) => {
          log.debug(`Tx validated. Estimated Gas ${estimatedGas}`);

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
        .catch((err) => {
          log.error('Validation failure', err);
          throw new SubmissionError({ _error: (err.message || JSON.stringify(err)) });
        });
    },
    onChangeAccount: (all, value) => {
      // load account information for selected account
      // const idx = all.findKey((acct) => acct.get('id') === value);
      // const balance = all.get(idx).get('balance');
      // dispatch(change('createTx', 'balance', balance));
    },
    onEntireBalance: (balance: TokenUnits, fee, isToken) => {
      if (balance) {
        let value;
        if (isToken) {
          value = balance.getDecimalized();
        } else {
          const wei = BigNumber.max(balance.value.sub(fee.value), new BigNumber(0));
          value = new TokenUnits(wei, 18).getDecimalized();
        }
        dispatch(change('createTx', 'value', value));
      }
    },
    onChangeGasLimit: (event, value) => {
      if (value) {
        dispatch(change('createTx', 'gas', value));
      }
    },
    onChangeToken: (event, value, prev) => {
      // if switching from ETC to token, change default gas
      if (prev.length < 1 && !(address(value))) {
        dispatch(change('createTx', 'gas', DefaultTokenGas));
      } else if (!(address(prev)) && value.length < 1) {
        dispatch(change('createTx', 'gas', DefaultGas));
      }
    },
    handleSelect: (event, item) => {
      dispatch(change('createTx', 'to', item.props.value));
    },
    cancel: () => {
      dispatch(screen.actions.gotoScreen('account', ownProps.account));
    },
    goDashboard: () => {
      dispatch(screen.actions.gotoScreen('home', ownProps.account));
    },
  })
)(CreateTxForm);


export default CreateTx;
