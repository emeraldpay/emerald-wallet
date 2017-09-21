import React from 'react';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import Avatar from 'material-ui/Avatar';
import { cardSpace, tables } from 'lib/styles';
import Immutable from 'immutable';
import { gotoScreen } from '../../store/wallet/screen/screenActions';
import Address from './address';

const Render = ({ addressBook, addAddress }) => {
    const table = <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
                <TableHeaderColumn style={tables.shortStyle}>Name</TableHeaderColumn>
                <TableHeaderColumn style={tables.wideStyle}>Address</TableHeaderColumn>
                <TableHeaderColumn style={tables.shortStyle}>Balance</TableHeaderColumn>
            </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
            {addressBook.map((addr) => <Address key={addr.get('id')} address={addr}/>)}
        </TableBody>
    </Table>;

    const titleStyle = {
        fontSize: '20px',
    };
    const titleAvatar = <Avatar icon={<FontIcon className="fa fa-address-book-o fa-2x" />} />;

    return (
        <div id="address-book">
            <Card style={cardSpace}>
                <CardHeader
                    title="Saved Addresses"
                    titleStyle={titleStyle}
                    avatar={titleAvatar}
                    actAsExpander={false}
                    showExpandableButton={false}
                />
                <CardText expandable={false}>
                    {table}
                </CardText>
                <CardActions>
                    <FlatButton label="Add Address"
                                onClick={addAddress}
                                icon={<FontIcon className="fa fa-plus-circle" />}/>
                </CardActions>
            </Card>
        </div>
    );
};

const AddressBook = connect(
    (state, ownProps) => ({
        addressBook: state.addressBook.get('addressBook', Immutable.List()),
    }),
    (dispatch, ownProps) => ({
        addAddress: () => {
            dispatch(gotoScreen('add-address'));
        },
    })
)(Render);

export default AddressBook;
