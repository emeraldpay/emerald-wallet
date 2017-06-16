import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import Avatar from 'material-ui/Avatar';
import { cardSpace } from 'lib/styles';
import Immutable from 'immutable';
import { translate } from 'react-i18next';
import { gotoScreen } from 'store/screenActions';
import Account from './account';

const Render = translate('accounts')(({ t, accounts, createAccount }) => {
    const table = <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
                <TableHeaderColumn xs={3}>Account</TableHeaderColumn>
                <TableHeaderColumn xs={5}>Address</TableHeaderColumn>
                <TableHeaderColumn xs={3}>Balance</TableHeaderColumn>
                <TableHeaderColumn xs={1}>Add Ether</TableHeaderColumn>
            </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
            {accounts.map((account) => <Account key={account.get('id')} account={account}/>)}
        </TableBody>
    </Table>;

    const titleStyle = {
        fontSize: '20px',
    };
    const titleAvatar = <Avatar icon={<FontIcon className="fa fa-address-book-o fa-2x" />} />;

    return (
        <div id="accounts-list">
            <Card style={cardSpace}>
                <CardHeader
                    title={t('list.title')}
                    titleStyle={titleStyle}
                    subtitle={t('list.subtitle')}
                    avatar={titleAvatar}
                    actAsExpander={false}
                    showExpandableButton={false}
                />
                <CardText expandable={false}>
                    {table}
                </CardText>
                <CardActions>
                    <FlatButton label={t('list.create')}
                                onClick={createAccount}
                                icon={<FontIcon className="fa fa-plus-circle" />}/>
                </CardActions>
            </Card>
        </div>
    );
});

Render.propTypes = {
    accounts: PropTypes.object.isRequired,
    createAccount: PropTypes.func.isRequired,
};

const AccountsList = connect(
    (state, ownProps) => ({
        accounts: state.accounts.get('accounts', Immutable.List()),
    }),
    (dispatch, ownProps) => ({
        createAccount: () => {
            dispatch(gotoScreen('create-account'));
        },
    })
)(Render);

export default AccountsList;
