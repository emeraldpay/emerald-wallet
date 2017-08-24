import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import log from 'electron-log';
import FlatButton from 'material-ui/FlatButton';

import AccountAddress from 'elements/AccountAddress';
import AddressAvatar from 'elements/addressAvatar';
import { gotoScreen } from 'store/screenActions';
import { toNumber, toDate } from 'lib/convert';
import IdentityIcon from 'elements/IdentityIcon';
import { Form, styles } from 'elements/Form';
import TxStatus from './status';


const Render = ({ transaction, rates, account, accounts, openAccount, goBack }) => {
    const fromAccount = transaction.get('from') ?
        accounts.find((acct) => acct.get('id') === transaction.get('from')) : null;
    const toAccount = transaction.get('to') ?
        accounts.find((acct) => acct.get('id') === transaction.get('to')) : null;


    const fieldNameStyle = {
        color: '#747474',
        fontSize: '16px',
        textAlign: 'right',
    };

    const amountEtcStyle = {
        fontSize: '20px',
        fontWeight: '500',
    };

    const amountFiatStyle = {
        fontSize: '14px',
    };

    const repeatButtonStyle = {
        height: '40px',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '1px',
        backgroundColor: '#EEE',
    };

    const txStatus = transaction.get('blockNumber') ? 'success' : 'queue';

    return (

        <Form caption="Ethereum Classic Transfer" onCancel={() => goBack(account)}>

            <div id="row" style={styles.formRow}>
                <div style={styles.left}>
                </div>
                <div style={styles.right}>
                    <div style={{display: 'flex'}}>
                        <div>
                            <div style={amountEtcStyle}>
                                {transaction.get('value') ? `${transaction.get('value').getEther()} ETC` : '--'}
                            </div>
                            <div style={amountFiatStyle}>
                                {transaction.get('value') ? `$${transaction.get('value').getFiat(rates.get('usd'))}` : ''}
                            </div>
                        </div>
                        <div>
                            <TxStatus status={ txStatus } />
                        </div>
                    </div>
                </div>
            </div>

            <div id="row" style={styles.formRow}>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>From</div>
                </div>
                <div style={{...styles.right, alignItems: 'center'}}>
                    <IdentityIcon size={30} expanded={true} id={transaction.get('from')}/>
                    <AddressAvatar
                        secondary={<AccountAddress id={transaction.get('from')}/>}
                        onClick={() => openAccount(fromAccount)}
                    />
                </div>
            </div>

            <div id="row" style={styles.formRow}>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>To</div>
                </div>
                <div style={{...styles.right, alignItems: 'center'}}>
                    <IdentityIcon size={30} expanded={true} id={transaction.get('to')}/>
                    <AddressAvatar
                        secondary={<AccountAddress id={transaction.get('to')}/>}
                        onClick={() => openAccount(toAccount)}
                    />
                </div>
            </div>

            <div id="row" style={styles.formRow}>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>Date</div>
                </div>
                <div style={styles.right}>
                    {transaction.get('timestamp') ? toDate(transaction.get('timestamp')) : null}
                </div>
            </div>

            <div id="row" style={styles.formRow}>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>GAS</div>
                </div>
                <div style={styles.right}>
                    {transaction.get('gas') ? transaction.get('gas') : null}
                </div>
            </div>

            <div id="row" style={styles.formRow}>
                <div style={styles.left}>
                </div>
                <div style={styles.right}>
                    <div>
                        <FlatButton
                            style={repeatButtonStyle}
                            label="REPEAT" />
                    </div>
                </div>
            </div>

            <div id="row" style={styles.formRow}>
                <hr style={{
                    backgroundColor: '#F5F5F5',
                    height: '2px',
                    width: '100%',
                    margin: '30px',
                    border: 'none'}} />
            </div>

            <div id="row" style={styles.formRow}>
                <div style={styles.left}>
                </div>
                <div style={styles.right}>
                    <div id="caption" style={{fontSize: '22px'}}>
                        Details
                    </div>
                </div>
            </div>

            <div id="row" style={styles.formRow}>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>Hash</div>
                </div>
                <div style={styles.right}>
                    {transaction.get('hash')}
                </div>
            </div>

            <div id="row" style={styles.formRow}>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>Block</div>
                </div>
                <div style={styles.right}>
                    {transaction.get('blockNumber') ? toNumber(transaction.get('blockNumber')) : 'pending'}
                </div>
            </div>

            <div id="row" style={styles.formRow}>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>Nonce</div>
                </div>
                <div style={styles.right}>
                    {transaction.get('nonce')}
                </div>
            </div>

            <div id="row" style={styles.formRow}>
                <div style={styles.left}>
                    <div style={fieldNameStyle}>Input Data</div>
                </div>
                <div style={styles.right}>
                    {transaction.get('input') === '0x' ? 'none' : transaction.get('input')}
                </div>
            </div>

        </Form>);
};

Render.propTypes = {
    hash: PropTypes.string.isRequired,
    transaction: PropTypes.object.isRequired,
    rates: PropTypes.object.isRequired,
    accounts: PropTypes.object.isRequired, // TODO toJS()?
    openAccount: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
};

const TransactionShow = connect(
    (state, ownProps) => {
        const accounts = state.accounts.get('accounts');
        const account = accounts.find(
           (acct) => acct.get('id') === ownProps.accountId
        );
        const rates = state.accounts.get('rates');
        const Tx = state.accounts.get('trackedTransactions').find(
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
        };
    },
    (dispatch, ownProps) => ({
        cancel: () => {
            dispatch(gotoScreen('home'));
        },
        goBack: (account) => {
            if (account) { dispatch(gotoScreen('account', account)); } else { dispatch(gotoScreen('home')); }
        },
        openAccount: (account) => {
            if (account) { dispatch(gotoScreen('account', account)); }
        },
    })
)(Render);

export default TransactionShow;
