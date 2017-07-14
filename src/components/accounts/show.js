import React from 'react';
import Immutable from 'immutable'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import { AddressAvatar } from 'elements/dl';
import People from 'material-ui/svg-icons/social/people';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import QRCode from 'qrcode.react';
import log from 'electron-log';
import { translate } from 'react-i18next';
import { cardSpace } from 'lib/styles';
import { gotoScreen } from 'store/screenActions';
import { updateAccount } from 'store/accountActions';
import AccountEdit from './edit';
import AccountPopup from './popup';
import TransactionsList from '../tx/list';
import AccountSendButton from './sendButton';
import AccountBalance from './balance';
import ExportAccountButton from './export';
import { Wei } from 'lib/types';
import { CardHeadEmerald } from 'elements/card';
import { cardStyle, formStyle } from 'lib/styles';
import IdentityIcon from './identityIcon';

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
    }

    handleEdit = () => {
        this.setState({ edit: true });
    }

    handleSave = (data) => {
        this.props.editAccount(data)
            .then((result) => {
                this.setState({ edit: false });
                log.debug(result);
            })
    }

    cancelEdit = () => {
        this.setState({ edit: false });
    }

    render() {
        const { account, rates, goBack, transactions } = this.props;
        const value = account.get('balance') ? account.get('balance').getEther() : '?';
        const pending = account.get('balancePending') ? `(${account.get('balancePending').getEther()} pending)` : null;

        return (
            <Grid style={cardStyle}>
              <CardHeadEmerald 
                backLabel='DASHBOARD'
                title='Wallet'
                cancel={goBack}
              />
                <Row top="xs">
                    <Col xs={12} md={8}>
                        <Row middle="xs">
                            <Col xs={1} xsOffset={4} style={formStyle.avatar}>
                                <IdentityIcon id={account.get('id')} expanded={true} />
                            </Col>
                            <Col xs={6} style={formStyle.group}>
                                <AccountBalance balance={account.get('balance') || new Wei(0) } withAvatar={true} />
                            </Col>
                        </Row>
                        <Row middle="xs">
                            <Col xs={1} xsOffset={4} style={formStyle.avatar}>
                                <People />
                            </Col>
                            <Col xs={6} style={formStyle.group}>
                                {!this.state.edit && <AddressAvatar
                                    addr={account.get('id')}
                                    tertiary={account.get('description')}
                                    nameEdit={account.get('name')}
                                    onClick={this.handleEdit}
                                />}
                                {this.state.edit && <AccountEdit
                                    address={account}
                                    submit={this.handleSave}
                                    cancel={this.cancelEdit}
                                 />}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6} xsOffset={5} style={formStyle.group}>
                                <AccountPopup account={account}/>
                                <AccountSendButton account={account} />
                                <ExportAccountButton account={account} />
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={4} md={2} mdOffset={1}>
                        <QRCode value={account.get('id')} />
                    </Col>
                </Row>
            <Row>
                <TransactionsList transactions={transactions}/>
            </Row>
        </Grid>
        );
    }
}

AccountRender.propTypes = {
    account: PropTypes.object.isRequired,
    goBack: PropTypes.func.isRequired,
    transactions: PropTypes.object.isRequired,
};

const AccountShow = connect(
    (state, ownProps) => {

        const accounts = state.accounts.get('accounts');
        const pos = accounts.findKey((acc) => acc.get('id') === ownProps.account.get('id'));
        const account = (accounts.get(pos) || Immutable.Map({}));
        let transactions = Immutable.List([]);
        if (account.get('id')) {
            transactions = state.accounts.get('trackedTransactions').filter((t) =>
                (account.get('id') === t.get('to') || account.get('id') === t.get('from'))
            )
        }
        const rates = state.accounts.get('rates');
        const balance = ownProps.account.get('balance');
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
        }
    })
)(AccountRender);

export default AccountShow;
