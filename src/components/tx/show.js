import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData } from 'elements/dl';
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
                <h2>
                    {transaction.get('value') ? `${transaction.get('value').getEther()} ETC` : '--'}
                    {!transaction.get('blockNumber') && <FlatButton label="in queue" secondary={true} />}
                </h2>
                {transaction.get('value') ? `$${transaction.get('value').getFiat(rates.get('usd'))}` : ''}

                <AccountItem
                    secondary={transaction.get('timestamp') ? toDate(transaction.get('timestamp')) : 'pending'}
                    primary="DATE"
                />
                <AddressAvatar
                    secondary={transaction.get('from')}
                    primary="FROM"
                    onClick={() => openAccount(fromAccount)}
                />
                <AddressAvatar
                    secondary={transaction.get('to')}
                    primary="TO"
                    onClick={() => openAccount(toAccount)}
                />
                <AccountItem secondary={transaction.get('gas')} primary="GAS" />
            </CardText>
            <CardActions>
                <FlatButton label="Go Back"
                            onClick={() => goBack(account)}
                            icon={<FontIcon className="fa fa-home" />}/>
            </CardActions>
            <CardText>
                <h4>Details</h4>
                <Row>
                    <Col xs={12}>
                        <DescriptionList>
                            <DescriptionTitle>Hash:</DescriptionTitle>
                            <DescriptionData>{transaction.get('hash')}</DescriptionData>

                            <DescriptionTitle>Block Number:</DescriptionTitle>
                            <DescriptionData>
                                {transaction.get('blockNumber') ? toNumber(transaction.get('blockNumber')) : 'pending'}
                            </DescriptionData>
                            <DescriptionTitle>Block hash:</DescriptionTitle>
                            <DescriptionData>{transaction.get('blockHash') || 'pending'}</DescriptionData>

                            <DescriptionTitle>nonce:</DescriptionTitle>
                            <DescriptionData>{toNumber(transaction.get('nonce'))}</DescriptionData>

                            <DescriptionTitle>Input Data:</DescriptionTitle>
                            <DescriptionData>
                                {transaction.get('input') === '0x' ? '--' : transaction.get('input')}
                            </DescriptionData>

                        </DescriptionList>
                    </Col>
                </Row>
            </CardText>
        </Card>
    );
}

Render.propTypes = {
    hash: PropTypes.string.isRequired,
    transaction: PropTypes.object.isRequired,
    rates: PropTypes.object.isRequired,
    accounts: PropTypes.array.isRequired,
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
        return {
            transaction: state.accounts.get('trackedTransactions').find(
                (tx) => tx.get('hash') === ownProps.hash
            ),
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
