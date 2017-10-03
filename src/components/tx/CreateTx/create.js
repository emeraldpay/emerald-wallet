import Immutable from 'immutable';
import BigNumber from 'bignumber.js';
import { change, formValueSelector, SubmissionError } from 'redux-form';
import { convert, Address } from 'emerald-js';
import { connect } from 'react-redux';
import { closeConnection, setWatch } from 'store/ledgerActions';
import { etherToWei } from 'lib/convert';
import { address } from 'lib/validators';
import launcher from 'store/launcher';
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

const traceValidate = (tx, dispatch): Promise<BigNumber> => {
    return new Promise((resolve, reject) => {
        dispatch(Tokens.actions.traceCall(tx.from, tx.to, tx.gas, tx.gasPrice, tx.value, tx.data))
            .then((gasEst) => {
                log.debug(`Estimated gas = ${JSON.stringify(gasEst)}`);

                if (!gasEst) {
                    reject('Invalid Transaction');
                } else if (gasEst.greaterThan(convert.toBigNumber(tx.gas))) {
                    reject(`Insufficient Gas. Expected ${gasEst}`);
                } else {
                    resolve(gasEst);
                }
            });
    });
};

const selector = formValueSelector('createTx');
const getGasPrice = (state) => state.network.get('gasPrice');

const selectBalance = (state, account) => {
    const tokens = state.tokens.get('tokens');
    const token = selector(state, 'token');
    if (Address.isValid(token)) {
        const tokenInfo = tokens.find((t) => t.get('address') === token);
        const accountBalance = account.get('tokens').find((t) => t.get('address') === token);
        return {
            symbol: tokenInfo.get('symbol'),
            value: accountBalance.get('balance'),
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

        const value = (selector(state, 'value')) ? selector(state, 'value') : 0;

        const useLedger = account.get('hardware', false);
        const ledgerConnected = state.ledger.get('connected');

        const gasLimit = selector(state, 'gas') ? new BigNumber(selector(state, 'gas')) : new BigNumber(DefaultGas);
        const fee = new TokenUnits(gasPrice.mul(gasLimit).value(), 18);

        return {
            initialValues: {
                gasPrice,
                fee,
                from: ownProps.account.get('id'),
                gas: DefaultGas,
                token: '',
                isTransfer: 'true',
                tokens: allTokens,
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
                    data: '',
                };
            }

            log.debug(JSON.stringify(tx));


            // 2. Validate Trace and then Send TX
            return traceValidate(tx, dispatch)
                .then((estimatedGas) => {
                    log.debug(`Tx validated by trace. Estimated Gas ${estimatedGas}`);

                    dispatch(setWatch(false));
                    return closeConnection().then(() => {
                        if (useLedger) {
                            return dispatch(screen.actions.showDialog('sign-transaction', data));
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
