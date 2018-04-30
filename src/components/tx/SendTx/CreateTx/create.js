// @flow
import BigNumber from 'bignumber.js';
import { Address, convert } from 'emerald-js';
import TokenUnits from 'lib/tokenUnits';
import { address } from 'lib/validators';
import { connect } from 'react-redux';
import { change, formValueSelector } from 'redux-form';
import Tokens from 'store/vault/tokens';
import createLogger from '../../../../utils/logger';
import CreateTxForm from './createTxForm';

const log = createLogger('CreateTx');

const DefaultGas = 21000;
const DefaultTokenGas = 23890;

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
  (state, ownProps) => ({
    addressBook: state.addressBook.get('addressBook'),
  }),
  (dispatch, ownProps) => ({
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
      ownProps.goDashboard();
    },
  })
)(CreateTxForm);


export default CreateTx;
