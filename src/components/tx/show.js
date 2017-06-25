import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData, ValueCard } from 'elements/dl';
import { AccountItem, AddressAvatar } from 'elements/dl';
import { cardSpace } from 'lib/styles';
import { gotoScreen } from 'store/screenActions';
import { toNumber, toDate } from 'lib/convert';

const Render = ({ transaction, rates, account, accounts, openAccount, goBack }) => {

    const fromAccount = transaction.get('from') ?
        accounts.find((acct) => acct.get('id') === transaction.get('from')) : null;
    const toAccount = transaction.get('to') ?
        accounts.find((acct) => acct.get('id') === transaction.get('to')) : null;

    return (
        <Card style={cardSpace}>
            <CardHeader title="Ethereum Classic Transfer"/>
            <CardText>
                <Row>
                    <Col xs={12}>
                        <h2>
                            {transaction.get('value') ? `${transaction.get('value').getEther()} ETC` : '--'}
                            {!transaction.get('blockNumber') && <FlatButton label="in queue" secondary={true} />}
                        </h2>
                        <h4>{transaction.get('value') ? `$${transaction.get('value').getFiat(rates.get('usd'))}` : ''}</h4>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={6}>
                        <Row>
                            <Col xs={12}>
                                <ValueCard
                                    value={transaction.get('timestamp') ? toDate(transaction.get('timestamp')) : null}
                                    name="DATE"
                                    default="pending"
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <AddressAvatar
                                    secondary={transaction.get('from')}
                                    primary="FROM"
                                    onClick={() => openAccount(fromAccount)}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <AddressAvatar
                                    secondary={transaction.get('to')}
                                    primary="TO"
                                    onClick={() => openAccount(toAccount)}
                                />
                            </Col>
                        </Row>
                        <Row>
                        <Col xs={12}>
                            <ValueCard
                                name="Nonce"
                                value={transaction.get('nonce')}
                            />
                        </Col>
                        </Row>
                        <Row>
                        <Col xs={12}>
                            <ValueCard
                                name="Input Data"
                                value={transaction.get('input') === '0x' ? 'none' : transaction.get('input')}
                                default="none"
                            />
                        </Col>
                        </Row>
                    </Col>
                    <Col xs={12} md={6}>
                        <Row>
                            <Col xs={12}>
                                <ValueCard
                                    name="Hash"
                                    value={transaction.get('hash')}
                                    default="--"
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <ValueCard
                                    name="Block Number"
                                    value={transaction.get('blockNumber') ? toNumber(transaction.get('blockNumber')) : null}
                                    default="pending"
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <ValueCard
                                    name="Block Hash"
                                    value={transaction.get('blockHash')}
                                    default="pending"
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </CardText>
            <CardActions>
                <FlatButton label="Go Back"
                            onClick={() => goBack(account)}
                            icon={<FontIcon className="fa fa-home" />}/>
            </CardActions>

        </Card>
    );
};

Render.propTypes = {
    hash: PropTypes.string.isRequired,
    transaction: PropTypes.object.isRequired,
    rates: PropTypes.object.isRequired,
    accounts: PropTypes.object.isRequired, //TODO toJS()?
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
            if (account)
                dispatch(gotoScreen('account', account));
            else
                dispatch(gotoScreen('home'));
        },
        openAccount: (account) => {
            if (account)
                dispatch(gotoScreen('account', account));
        }
    })
)(Render);

export default TransactionShow;
