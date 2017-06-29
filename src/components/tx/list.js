import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import log from 'electron-log';
import { cardSpace, tables, noShadow, grayBackground } from 'lib/styles';
import Immutable from 'immutable';
import Transaction from './transaction';
import { gotoScreen } from 'store/screenActions';
import { align } from 'lib/styles';

const Render = ({ transactions, sendTx, accounts, createAccount }) => {
    const styles = {
        root: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
        },
        titleStyle: {
            fontSize: '20px',
        },
    };

    const table = <Table style={{...grayBackground, ...{tableLayout: 'auto'}}} selectable={false} fixedHeader={true}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
                <TableHeaderColumn >Amount</TableHeaderColumn> {/* style={tables.mediumStyle} */}
                <TableHeaderColumn >Status</TableHeaderColumn> {/* style={tables.shortestStyle} */}
                <TableHeaderColumn >From</TableHeaderColumn> {/* style={tables.wideStyle} */}
                <TableHeaderColumn ></TableHeaderColumn> {/* style={tables.shortestStyle} */}
                <TableHeaderColumn >To</TableHeaderColumn> {/* style={tables.wideStyle} */}
            </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
            {transactions.map((tx) => <Transaction key={tx.get('hash')} tx={tx}/>)}
        </TableBody>
    </Table>;

    const titleAvatar = <Avatar icon={<FontIcon className="fa fa-dot-circle-o fa-2x" />} />;

    return (
        <div id="tx-list">
            <Card style={{...grayBackground, ...noShadow, ...cardSpace}}>
                <CardHeader
                    title="Transaction History"
                    titleStyle={styles.titleStyle}
                    avatar={titleAvatar}
                    actAsExpander={false}
                    showExpandableButton={false}
                />
                <CardActions style={align.center}>
                {
                    (() => {
                        if (transactions.length) {
                            return <CardText style={styles.root} expandable={false}>
                                {table}
                            </CardText>
                        }
                        if (accounts.length && accounts[0] !== Immutable.Map({})) {
                            return <FlatButton label="Send A Transaction"
                                icon={<FontIcon className="fa fa-play-circle" />}
                                style={{backgroundColor: 'limegreen', color: 'white'}}
                                onClick={sendTx(accounts[0])}/>
                        }
                        return <FlatButton label="Create an Account"
                                icon={<FontIcon className="fa fa-play-circle" />}
                                style={{backgroundColor: 'limegreen', color: 'white'}}
                                onClick={createAccount}/>
                    })()
                    }
                }
                </CardActions>
            </Card>
        </div>
    );
};

Render.propTypes = {
    transactions: PropTypes.object.isRequired,
    accounts: PropTypes.object.isRequired,
    createAccount: PropTypes.func.isRequired,
    sendTx: PropTypes.func.isRequired,
};

const TransactionsList = connect(
    (state, ownProps) => {
        const transactionsAccounts = state.accounts.get('trackedTransactions', Immutable.List());
        const txs = ownProps.transactions || transactionsAccounts;
        const accounts = state.accounts.get('accounts');
        return {
            transactions: txs.reverse(),
            accounts,
        };
    },
    (dispatch, ownProps) => ({
        sendTx: (acc) => {
            dispatch(gotoScreen('create-tx', acc));
        },
        createAccount: () => {
            dispatch(gotoScreen('generate'));
        },
    })
)(Render);

export default TransactionsList;
