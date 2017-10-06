import React from 'react';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import People from 'material-ui/svg-icons/social/people';
import QRCode from 'qrcode.react';
import TokenUnits from 'lib/tokenUnits';
import IdentityIcon from 'elements/IdentityIcon';
import { Form, styles, Row } from 'elements/Form';
import Button from 'elements/Button/index';
import { QrCodeIcon } from 'elements/Icons';
import AddressAvatar from 'elements/AddressAvatar/addressAvatar';
import DashboardButton from 'components/common/DashboardButton';
import accounts from '../../../store/vault/accounts';
import screen from '../../../store/wallet/screen';

import createLogger from '../../../utils/logger';
import AccountEdit from '../edit';
import TransactionsList from '../../tx/TxHistory';
import AccountBalance from '../Balance';
import SecondaryMenu from '../SecondaryMenu';

import classes from './show.scss';
import TokenBalances from '../TokenBalances';


const log = createLogger('AccountShow');

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
        const pending = account.get('balancePending') ? `(${account.get('balancePending').getEther()} pending)` : null;
        const isHardware = (acc) => acc.get('hardware', false);

        // TODO: we convert Wei to TokenUnits here
        const balance = account.get('balance') ? new TokenUnits(account.get('balance').value(), 18) : null;

        return (
            <div>
                <div style={{display: 'flex', alignItems: 'stretch'}}>
                    <div style={{flexGrow: 1}}>
                        <Form caption="Account" backButton={ <DashboardButton onClick={ goBack }/> }>
                            <Row>
                                <div id="left-column" style={styles.left}>
                                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                        <IdentityIcon id={account.get('id')} expanded={true} />
                                    </div>
                                </div>
                                <div style={styles.right}>
                                    <AccountBalance
                                        coinsStyle={{fontSize: '20px', lineHeight: '24px'}}
                                        balance={ balance }
                                        symbol="ETC"
                                    />
                                </div>
                            </Row>

                            <Row>
                                <div style={ styles.left }>
                                </div>
                                <div style={ styles.right }>
                                    <TokenBalances balances={ account.get('tokens') }/>
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
                    <div className={ classes.qrCodeContainer }>
                        <QRCode value={ account.get('id') } />
                    </div>
                </div>
                <div className={ classes.transContainer }>
                    <TransactionsList transactions={ transactions } accountId={ account.get('id') } />
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
        const all = state.accounts.get('accounts');
        let account = ownProps.account;
        const listPos = all.findKey((acc) => acc.get('id').toLowerCase() === account.get('id').toLowerCase());
        if (listPos >= 0) {
            account = all.get(listPos);
        } else {
            log.warn("Can't find account in general list of accounts", account.get('id'), listPos);
        }
        let transactions = Immutable.List([]);
        if (account.get('id')) {
            transactions = state.wallet.history.get('trackedTransactions').filter((t) =>
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
            dispatch(screen.actions.gotoScreen('create-tx', account));
        },
        showReceiveDialog: () => {
            const account = ownProps.account;
            dispatch(screen.actions.showDialog('receive', account));
        },
        goBack: () => {
            dispatch(screen.actions.gotoScreen('home'));
        },
        editAccount: (data) => {
            return new Promise((resolve, reject) => {
                dispatch(accounts.actions.updateAccount(data.address, data.name, data.description))
                        .then((response) => {
                            resolve(response);
                        });
            });
        },
    })
)(AccountRender);

export default AccountShow;
