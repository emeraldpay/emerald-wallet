import Immutable from 'immutable';
import log from 'loglevel';
import { change, formValueSelector, SubmissionError } from 'redux-form';

import { connect } from 'react-redux';
import { sendTransaction, trackTx } from 'store/accountActions';
import { transferTokenTransaction, traceTokenTransaction, traceCall } from 'store/tokenActions';
import { gotoScreen } from 'store/screenActions';
import { mweiToWei, etherToWei, toHex, estimateGasFromTrace } from 'lib/convert';
import { address } from 'lib/validators';

import CreateTxForm from './createTxForm';

const DefaultGas = 21000;
const DefaultTokenGas = 23890;

const traceValidate = (data, dispatch) => {
    const dataObj = {
        from: data.from,
        gasPrice: toHex(mweiToWei(data.gasPrice)),
        gas: toHex(data.gas),
        to: data.to,
        value: toHex(etherToWei(data.value)),
    };
    const resolveValidate = (response, resolve) => {
        let errors = null;
        dataObj.data = (((response.trace || [])[0] || {}).action || {}).input;
        let gasEst;
        if (response.gas) gasEst = response.gas;
        else {
            gasEst = estimateGasFromTrace(dataObj, response);
            gasEst = (gasEst && gasEst.div(dataObj.gasPrice).toString(10));
        }
        if (!gasEst) {
            errors = { value: 'Invalid Transaction' };
        } else if (gasEst > data.gas) {
            errors = { gas: `Insufficient Gas: Expected ${gasEst}` };
        }
        resolve(errors);
    };

    if (data.token.length > 1) {
        return new Promise((resolve, reject) => {
            dispatch(traceTokenTransaction(data.from,
              data.to,
              dataObj.gas,
              dataObj.gasPrice,
              dataObj.value,
              data.token, data.isTransfer
            )).then((response) => resolveValidate(response, resolve))
              .catch((error) => {
                  resolve({ _error: (error.message || JSON.stringify(error)) });
              });
        });
    }
    return new Promise((resolve, reject) => {
        dispatch(traceCall(data.from,
              data.to,
              dataObj.gas,
              dataObj.gasPrice,
              dataObj.value
            )).then((response) => resolveValidate(response, resolve))
              .catch((error) => {
                  resolve({ _error: (error.message || JSON.stringify(error)) });
              });
    });
};

const CreateTx = connect(
    (state, ownProps) => {
        const selector = formValueSelector('createTx');
        const tokens = state.tokens.get('tokens');
        const balance = ownProps.account.get('balance').getEther(6);
        const gasPrice = state.accounts.get('gasPrice').getMwei();
        return {
            initialValues: {
                from: ownProps.account.get('id'),
                gas: DefaultGas,
                token: '',
                isTransfer: 'true',
                gasPrice,
                balance,
            },
            accounts: state.accounts.get('accounts', Immutable.List()),
            addressBook: state.addressBook.get('addressBook'),
            tokens: tokens.unshift(Immutable.fromJS({ address: '', symbol: 'ETC' })),
            isToken: (selector(state, 'token')),
        };
    },
    (dispatch, ownProps) => ({
        onSubmit: (data) => {
            log.debug(data);
            traceValidate(data, dispatch)
                .then((result) => {
                    if (result) {
                        throw new SubmissionError(result);
                    } else {
                        if (data.token.length > 1) {
                            log.error('unsupported');
                            return
                        }
                        dispatch(
                            sendTransaction(data.from, data.password, data.to,
                                toHex(data.gas), toHex(mweiToWei(data.gasPrice)),
                                toHex(etherToWei(data.value)))
                        );
                    }
                });
        },
        onChangeAccount: (accounts, value) => {
            // load account information for selected account
            const idx = accounts.findKey((acct) => acct.get('id') === value);
            const balance = accounts.get(idx).get('balance');
            dispatch(change('createTx', 'balance', balance.toString()));
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
            dispatch(gotoScreen('account', ownProps.account));
        },
    })
)(CreateTxForm);


export default CreateTx;
