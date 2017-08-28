import React from 'react';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import People from 'material-ui/svg-icons/social/people';
import QRCode from 'qrcode.react';
import log from 'electron-log';

import AddressAvatar from 'elements/AddressAvatar/addressAvatar';
import { gotoScreen, showDialog } from 'store/screenActions';
import { updateAccount } from 'store/accountActions';
import { Wei } from 'lib/types';
import IdentityIcon from 'elements/IdentityIcon';
import { Form, styles, Row } from 'elements/Form';
import Button from 'elements/Button/index';
import { QrCodeIcon } from 'elements/Icons';

import AccountEdit from '../edit';
import TransactionsList from '../../tx/TxHistory';
import AccountBalance from '../AccountBalance';
import SecondaryMenu from '../SecondaryMenu';

import classes from './show.scss';

const TokenRow = ({ token }) => {
    const balance = token.get('balance') ? token.get('balance').getDecimalized() : '0';

    return (
        <div><span>{balance} {token.get('symbol')}</span></div>
    );
};
TokenRow.propTypes = {
    token: PropTypes.object.isRequired,
};

class AccountRender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            showModal: false,
        };
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);
    }

    handleEdit() {
        this.setState({ edit: true });
    }

    handleSave(data) {
        this.props.editAccount(data)
            .then((result) => {
                this.setState({ edit: false });
                log.debug(result);
            });
    }

    cancelEdit() {
        this.setState({ edit: false });
    }

    render() {
        const { account, rates, goBack, transactions, createTx, showReceiveDialog } = this.props;
        const value = account.get('balance') ? account.get('balance').getEther() : '?';
        const pending = account.get('balancePending') ? `(${account.get('balancePending').getEther()} pending)` : null;
        const isHardware = (acc) => acc.get('hardware', false);

        const AccountDetails = (

            <div style={{display: 'flex', alignItems: 'stretch'}}>
                <div style={{flexGrow: 1}}>
                    <Form caption="Account" onCancel={ goBack }>
                        <Row>
                            <div id="left-column" style={styles.left}>
                                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                    <IdentityIcon id={account.get('id')} expanded={true} />
                                </div>
                            </div>
                            <div style={styles.right}>
                                <AccountBalance balance={account.get('balance') || new Wei(0) } withAvatar={true} />
                            </div>
                        </Row>

                        <Row>
                            <div style={styles.left}>
                                <div style={styles.fieldName}>
                                    <People />
                                </div>
                            </div>
                            <div style={styles.right}>
                                {!this.state.edit && <AddressAvatar
                                    addr={account.get('id')}
                                    tertiary={account.get('description')}
                                    nameEdit={account.get('name')}
                                    onEditClick={this.handleEdit}
                                />}
                                {this.state.edit && <AccountEdit
                                    address={account}
                                    submit={this.handleSave}
                                    cancel={this.cancelEdit}
                                />}
                            </div>
                        </Row>

                        <Row>
                            <div style={styles.left}/>
                            <div style={styles.right}>
                                <div>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Button
                                            primary
                                            label="Add ETC"
                                            icon={ <QrCodeIcon color="white"/> }
                                            onClick={ showReceiveDialog }
                                        />
                                        <Button
                                            primary
                                            style={ {marginLeft: '10px'} }
                                            label="Send"
                                            onClick={ createTx }
                                        />
                                        { !isHardware(account) && <SecondaryMenu account={account} /> }
                                    </div>
                                </div>
                            </div>
                        </Row>

                    </Form>
                </div>
                <div style={{flexBasis: '30%', backgroundColor: 'white', paddingTop: '110px'}}>
                    <QRCode value={account.get('id')} />
                </div>
            </div>
        );

        return (
            <div>
                <div>
                    {AccountDetails}
                </div>
                <div className={ classes.transContainer }>
                    <TransactionsList transactions={transactions}/>
                </div>
            </div>
        );
    }
}

AccountRender.propTypes = {
    account: PropTypes.object.isRequired,
    goBack: PropTypes.func.isRequired,
    transactions: PropTypes.object.isRequired,
    editAccount: PropTypes.func,
    createTx: PropTypes.func,
    showReceiveDialog: PropTypes.func,
};

const AccountShow = connect(
    (state, ownProps) => {
        const accounts = state.accounts.get('accounts');
        let account = ownProps.account;
        const listPos = accounts.findKey((acc) => acc.get('id').toLowerCase() === account.get('id').toLowerCase());
        if (listPos >= 0) {
            account = accounts.get(listPos);
        } else {
            log.warn("Can't find account in general list of accounts", account.get('id'), listPos);
        }
        let transactions = Immutable.List([]);
        if (account.get('id')) {
            transactions = state.accounts.get('trackedTransactions').filter((t) =>
                (account.get('id') === t.get('to') || account.get('id') === t.get('from'))
            );
        }
        const rates = state.accounts.get('rates');
        const balance = account.get('balance');
        let fiat = {};
        if (rates && balance) {
            fiat = {
                btc: balance.getFiat(rates.get('btc')),
                eur: balance.getFiat(rates.get('eur')),
                usd: balance.getFiat(rates.get('usd')),
                cny: balance.getFiat(rates.get('cny')),
            };
        }
        return {
            fiat,
            rates,
            account,
            transactions,
        };
    },
    (dispatch, ownProps) => ({
        createTx: () => {
            const account = ownProps.account;
            dispatch(gotoScreen('create-tx', account));
        },
        showReceiveDialog: () => {
            const account = ownProps.account;
            dispatch(showDialog('receive', account));
        },
        goBack: () => {
            dispatch(gotoScreen('home'));
        },
        editAccount: (data) => {
            return new Promise((resolve, reject) => {
                dispatch(updateAccount(data.address, data.name, data.description))
                        .then((response) => {
                            resolve(response);
                        });
            });
        },
    })
)(AccountRender);

export default AccountShow;
