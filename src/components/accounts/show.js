import React from 'react';
import Immutable from 'immutable'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardActions, CardText } from 'material-ui/Card';
import { AddressAvatar } from 'elements/dl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import QRCode from 'qrcode.react';
import log from 'loglevel';
import { translate } from 'react-i18next';
import { cardSpace } from 'lib/styles';
import { gotoScreen } from 'store/screenActions';
import { updateAccount } from 'store/accountActions';
import AccountEdit from './edit';
import AccountPopup from './popup';
import TransactionsList from '../tx/list';
import AccountSendButton from './sendButton';
import AccountBalance from './balance';
import { Wei } from 'lib/types';

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

        const styles = {
                sendButton: {
                    color: 'green',
                },
        };

        return (
        <div>
        <Card style={cardSpace}>
            <CardActions>
                <FlatButton label="DASHBOARD"
                            primary={true}
                            onClick={goBack}
                            icon={<FontIcon className="fa fa-arrow-left" />}/>
            </CardActions>
            <CardText>
                <Row>
                    <Col xs={8}>
                        {/* }<h2>
                            {value}
                            {pending && <FlatButton label={pending} primary={true} />}
                        </h2>
                        {account.get('balance') ? `$${account.get('balance').getFiat(rates.get('usd'))}` : ''}
                        */}
                       <AccountBalance balance={account.get('balance') || new Wei(0) } withAvatar={true} />

                        {!this.state.edit && <AddressAvatar
                            secondary={account.get('id')}
                            tertiary={account.get('description')}
                            primary={account.get('name')}
                            onClick={this.handleEdit}
                        />}
                        {this.state.edit && <AccountEdit
                            address={account}
                            submit={this.handleSave}
                            cancel={this.cancelEdit}
                         />}
                    </Col>
                    <Col xs={4} md={2} mdOffset={2}>
                        <QRCode value={account.get('id')} />
                    </Col>
                </Row>
            </CardText>
            <CardActions>
                <AccountPopup account={account}/>
                <AccountSendButton account={account} />
            </CardActions>
        </Card>

        <TransactionsList transactions={transactions}/>
        </div>
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
