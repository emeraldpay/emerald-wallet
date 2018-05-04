// @flow
import BigNumber from 'bignumber.js';
import { Address, convert } from 'emerald-js';
import { etherToWei } from 'lib/convert';
import TokenUnits from 'lib/tokenUnits';
import { address } from 'lib/validators';
import { connect } from 'react-redux';
import { SubmissionError, change, formValueSelector } from 'redux-form';
import Tokens from 'store/vault/tokens';
import createLogger from '../../../../utils/logger';
import CreateTxForm from './createTxForm';

const { toHex, toBaseUnits } = convert;

const log = createLogger('CreateTx');

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
    onSubmit: (data) => {
      // TODO: In this handler we should create native tx and estimate gas

      const tx = {
        from: data.from,
        to: data.to,
        gas: data.gas,
        gasPrice: data.gasPrice,
      };

      let nativeTx;
      // 1. Create TX here
      if (Address.isValid(data.token)) {
        // Token TX
        const tokenInfo = data.tokens.find((t) => t.get('address') === data.token);
        if (!tokenInfo) {
          throw new SubmissionError(`Unknown token ${data.token}`);
        }
        tx.symbol = tokenInfo.get('symbol');
        const decimals = convert.toNumber(tokenInfo.get('decimals'));
        const tokenUnits: BigNumber = toBaseUnits(convert.toBigNumber(data.value), decimals);
        const txData = Tokens.actions.createTokenTxData(
          data.to,
          tokenUnits,
          data.isTransfer);

        nativeTx = {
          from: data.from,
          gasPrice: toHex(data.gasPrice.value()),
          gas: toHex(data.gas),
          to: data.token,
          value: convert.toHex(0),
          data: txData,
        };
      } else {
        // Ordinary Tx
        nativeTx = {
          from: data.from,
          gasPrice: toHex(data.gasPrice.value()),
          gas: toHex(data.gas),
          to: data.to,
          value: toHex(etherToWei(data.value)),
        };
        tx.symbol = 'ETC';
      }

      if (ownProps.onCreateTransaction) {
        ownProps.onCreateTransaction(data, nativeTx, tx);
      }
    },
  })
)(CreateTxForm);


export default CreateTx;
