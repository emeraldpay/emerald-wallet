/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import { convert } from 'emerald-js';

import AccountAddress from '../../../elements/AccountAddress';
import AddressAvatar from '../../../elements/AddressAvatar';
import { gotoScreen } from '../../../store/wallet/screen/screenActions';
import { toDate } from '../../../lib/convert';
import IdentityIcon from '../../../elements/IdentityIcon';
import { Form, styles, Row } from '../../../elements/Form';
import TxStatus from './status';
import { Currency } from '../../../lib/currency';

import createLogger from '../../../utils/logger';

import classes from './show.scss';

const log = createLogger('TxDetails');

const TransactionShow = ({ transaction, rates, account, accounts, openAccount, goBack, currentCurrency }) => {
    const fromAccount = transaction.get('from') ?
        accounts.find((acct) => acct.get('id') === transaction.get('from')) : null;
    const toAccount = transaction.get('to') ?
        accounts.find((acct) => acct.get('id') === transaction.get('to')) : null;


    const fieldNameStyle = {
        color: '#747474',
        fontSize: '16px',
        textAlign: 'right',
    };

    const repeatButtonStyle = {
        height: '40px',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '1px',
        backgroundColor: '#EEE',
    };

    const blockNumber = transaction.get('blockNumber');
    const txStatus = blockNumber ? 'success' : 'queue';

    const fiatAmount = transaction.get('value') ?
        Currency.format(transaction.get('value').getFiat(rates.get(currentCurrency.toLowerCase())), currentCurrency) :
        '';

    return (
        <Form caption="Ethereum Classic Transfer" onCancel={() => goBack(account)}>
            <Row>
                <div style={styles.left}>
                </div>
                <div style={styles.right}>
                    <div style={{display: 'flex'}}>
                        <div>
                            <div className={ classes.etcAmount }>
                                { transaction.get('value') ? `${transaction.get('value').getEther()} ETC` : '--' }
                            </div>
                            <div className={ classes.fiatAmount }>
                                { fiatAmount }
                            </div>
                        </div>
                        <div>
                            <TxStatus status={ txStatus } />
                        </div>
                    </div>
                </div>
            </Row>

            <Row>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>From</div>
                </div>
                <div style={{...styles.right, alignItems: 'center'}}>
                    <IdentityIcon size={ 30 } expanded={ true } id={ transaction.get('from') }/>
                    <AddressAvatar
                        secondary={<AccountAddress id={ transaction.get('from') }/>}
                        onClick={ () => openAccount(fromAccount) }
                    />
                </div>
            </Row>

            <Row>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>To</div>
                </div>
                <div style={{...styles.right, alignItems: 'center'}}>
                    <IdentityIcon size={30} expanded={true} id={transaction.get('to')}/>
                    <AddressAvatar
                        secondary={ <AccountAddress id={ transaction.get('to') }/>}
                        onClick={ () => openAccount(toAccount) }
                    />
                </div>
            </Row>

            <Row>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>Date</div>
                </div>
                <div style={styles.right}>
                    {transaction.get('timestamp') ? toDate(transaction.get('timestamp')) : null}
                </div>
            </Row>

            <Row>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>GAS</div>
                </div>
                <div style={styles.right}>
                    {transaction.get('gas') ? transaction.get('gas') : null}
                </div>
            </Row>

            <Row>
                <div style={styles.left}>
                </div>
                <div style={styles.right}>
                    <div>
                        <FlatButton
                            style={repeatButtonStyle}
                            label="REPEAT" />
                    </div>
                </div>
            </Row>

            <Row>
                <hr style={{
                    backgroundColor: '#F5F5F5',
                    height: '2px',
                    width: '100%',
                    margin: '30px',
                    border: 'none'}} />
            </Row>

            <Row>
                <div style={styles.left}>
                </div>
                <div style={styles.right}>
                    <div id="caption" style={{fontSize: '22px'}}>
                        Details
                    </div>
                </div>
            </Row>

            <Row>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>Hash</div>
                </div>
                <div style={styles.right}>
                    {transaction.get('hash')}
                </div>
            </Row>

            <Row>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>Block</div>
                </div>
                <div style={styles.right}>
                    { blockNumber ? convert.toNumber(blockNumber) : 'pending' }
                </div>
            </Row>

            <Row>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>Nonce</div>
                </div>
                <div style={styles.right}>
                    { transaction.get('nonce') }
                </div>
            </Row>

            <Row>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>Input Data</div>
                </div>
                <div style={styles.right}>
                    {transaction.get('input') === '0x' ? 'none' : transaction.get('input')}
                </div>
            </Row>

        </Form>);
};

TransactionShow.propTypes = {
    hash: PropTypes.string.isRequired,
    transaction: PropTypes.object.isRequired,
    rates: PropTypes.object.isRequired,
    accounts: PropTypes.object.isRequired,
    openAccount: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
};

export default connect(
    (state, ownProps) => {
        const accounts = state.accounts.get('accounts');
        const account = accounts.find(
           (acct) => acct.get('id') === ownProps.accountId
        );
        const rates = state.wallet.settings.get('rates');
        const currentCurrency = state.wallet.settings.get('localeCurrency');

        const Tx = state.wallet.history.get('trackedTransactions').find(
            (tx) => tx.get('hash') === ownProps.hash
        );
        if (!Tx) {
            log.error("Can't find tx for hash", ownProps.hash);
        }
        return {
            hash: Tx.get('hash'),
            transaction: Tx,
            account: (account === undefined) ? undefined : account,
            accounts,
            rates,
            currentCurrency,
        };
    },
    (dispatch, ownProps) => ({
        cancel: () => {
            dispatch(gotoScreen('home'));
        },
        goBack: (account) => {
            if (account) {
                dispatch(gotoScreen('account', account));
            } else {
                dispatch(gotoScreen('home'));
            }
        },
        openAccount: (account) => {
            if (account) {
                dispatch(gotoScreen('account', account));
            }
        },
    })
)(TransactionShow);

