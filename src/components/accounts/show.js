import React from 'react';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AddressAvatar from 'elements/addressAvatar';
import People from 'material-ui/svg-icons/social/people';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MoreHorizIcon from 'material-ui/svg-icons/navigation/more-horiz';
import QRCode from 'qrcode.react';
import log from 'electron-log';
import { gotoScreen } from 'store/screenActions';
import { updateAccount } from 'store/accountActions';
import AccountEdit from './edit';
import AccountPopup from './popup';
import TransactionsList from '../tx/list';
import AccountSendButton from './sendButton';
import AccountBalance from './AccountBalance';
import ExportAccountButton from './export';
import PrintAccountButton from './print';
import { Wei } from 'lib/types';
import IdentityIcon from '../../elements/IdentityIcon';
import {InnerDialog, styles} from '../../elements/innerDialog';

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
        const { account, rates, goBack, transactions } = this.props;
        const value = account.get('balance') ? account.get('balance').getEther() : '?';
        const pending = account.get('balancePending') ? `(${account.get('balancePending').getEther()} pending)` : null;

        const AccountDetails = (

            <div style={{display: 'flex', alignItems: 'stretch'}}>
                <div style={{flexGrow: 1}}>
                    <InnerDialog caption="Wallet" onCancel={goBack}>

                        <div id="row" style={styles.formRow}>
                            <div id="left-column" style={styles.left}>
                                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                    <IdentityIcon id={account.get('id')} expanded={true} />
                                </div>
                            </div>
                            <div style={styles.right}>
                                <AccountBalance balance={account.get('balance') || new Wei(0) } withAvatar={true} />
                            </div>
                        </div>

                        <div id="row" style={styles.formRow}>
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
                        </div>

                        <div id="row" style={styles.formRow}>
                            <div style={styles.left}>
                            </div>
                            <div style={styles.right}>
                                <div>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <AccountPopup textColor='white' backgroundColor='#47B04B' account={account} />
                                        <AccountSendButton textColor='white' backgroundColor='#47B04B' account={account} />
                                        <IconMenu
                                            iconButtonElement={<IconButton><MoreHorizIcon /></IconButton>}>
                                            <ExportAccountButton account={account} />
                                            <PrintAccountButton account={account} />
                                        </IconMenu>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </InnerDialog>
                </div>
                <div style={{flexBasis: '30%', backgroundColor: 'white', marginTop: '20px', paddingTop: '110px'}}>
                    <QRCode value={account.get('id')} />
                </div>
            </div>
        );

        return (
            <div>
                <div>
                    {AccountDetails}
                </div>
                <div>
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
