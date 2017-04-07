import React from 'react';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import Avatar from 'material-ui/Avatar';
import { cardSpace, tables } from 'lib/styles';
import log from 'loglevel';
import Immutable from 'immutable';
import { gotoScreen } from '../../store/screenActions';
import Account from './account';

const Render = ({accounts, createAccount}) => {

    const table = <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
                <TableHeaderColumn style={tables.wideStyle}>Account</TableHeaderColumn>
                <TableHeaderColumn style={tables.shortStyle}>Balance</TableHeaderColumn>
            </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
            {accounts.map( (account) => <Account key={account.get('id')} account={account}/>)}
        </TableBody>
    </Table>;

    const titleStyle = {
        fontSize: "20px",
    };
    const titleAvatar = <Avatar icon={<FontIcon className="fa fa-address-book-o fa-2x" />} />;

    return (
        <div id="accounts-list">
            <Card style={cardSpace}>
                <CardHeader
                    title="Accounts List"
                    titleStyle={titleStyle}
                    subtitle="List of addresses you're controlling on Ethereum Classic blockchain"
                    avatar={titleAvatar}
                    actAsExpander={false}
                    showExpandableButton={false}
                />
                <CardText expandable={false}>
                    {table}
                </CardText>
                <CardActions>
                    <FlatButton label="Create Account"
                                onClick={createAccount}
                                icon={<FontIcon className="fa fa-plus-circle" />}/>
                </CardActions>
            </Card>
        </div>
    )
};

const AccountsList = connect(
    (state, ownProps) => {
        return {
            accounts: state.accounts.get('accounts', Immutable.List()),
        }
    },
    (dispatch, ownProps) => {
        return {
            createAccount: () => {
                dispatch(gotoScreen('create-account'))
            }
        }
    }
)(Render);

export default AccountsList