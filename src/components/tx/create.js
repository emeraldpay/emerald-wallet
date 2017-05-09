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
        gas: toHex(data.gasAmount),
        to: data.to,
        value: toHex(etherToWei(data.value)),
    };

    const resolveValidate = (response, resolve) => {
        let errors = null;
        dataObj.data = (((response.trace || [])[0] || {}).action || {}).input;
        const gas = estimateGasFromTrace(dataObj, response);
        if (!gas) {
            errors = { value: 'Invalid Transaction' };
        } else if (gas > dataObj.gas) {
            errors = { gasAmount: `Insufficient Gas: Expected ${gas.toString(10)}` };
        }
        resolve(errors);
    };

    if (data.token.length > 1) {
        return new Promise((resolve, reject) => {
            dispatch(traceTokenTransaction(data.from, data.password,
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
        dispatch(traceCall(data.from, data.password,
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
        return {
            initialValues: {
                from: ownProps.account.get('id'),
                gasPrice: 10000,
                gasAmount: DefaultGas,
                token: '',
                isTransfer: 'true',
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
            const afterTx = (txhash) => {
                const txdetails = {
                    hash: txhash,
                    account: data.from,
                };
                dispatch(trackTx(txhash));
                dispatch(gotoScreen('transaction', txdetails));
            };
            const resolver = (resolve, f) => (x) => {
                f.apply(x);
                resolve(x);
            };
            return traceValidate(data, dispatch)
                    .then((result) => {
                        if (result) {
                            throw new SubmissionError(result);
                        } else {
                            if (data.token.length > 1) {
                                return new Promise((resolve, reject) => {
                                    dispatch(transferTokenTransaction(data.from, data.password,
                                        data.to, toHex(data.gasAmount),
                                        toHex(mweiToWei(data.gasPrice)),
                                        toHex(etherToWei(data.value)),
                                        data.token, data.isTransfer))
                                        .then(resolver(afterTx, resolve));
                                });
                            }
                            return new Promise((resolve, reject) => {
                                dispatch(sendTransaction(data.from, data.password, data.to,
                                        toHex(data.gasAmount), toHex(mweiToWei(data.gasPrice)),
                                        toHex(etherToWei(data.value))
                                    )).then(resolver(afterTx, resolve));
                            });
                        }
                    });
        },
        onChangeToken: (event, value, prev) => {
            // if switching from ETC to token, change default gas
            if (prev.length < 1 && !(address(value))) {
                dispatch(change('createTx', 'gasAmount', DefaultTokenGas));
            } else if (!(address(prev)) && value.length < 1) {
                dispatch(change('createTx', 'gasAmount', DefaultGas));
            }
        },
        handleSelect: (event, item) => {
            dispatch(change('createTx', 'to', item.props.value));
        },
        cancel: () => {
            dispatch(gotoScreen('home'));
        },
    })
)(CreateTxForm);


export default CreateTx;
