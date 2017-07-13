import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TableRow, TableRowColumn } from 'material-ui/Table';

import { AddressAvatar, AccountAddress } from 'elements/dl';
import AccountSendButton from './sendButton';
import { gotoScreen } from 'store/screenActions';
import log from 'electron-log';
import { align } from 'lib/styles';
import AccountPopup from './popup';
import AccountBalance from './balance';
import { Wei } from 'lib/types';
import IdentityIcon from './identityIcon';


const Render = ({ account, openAccount }) => {
    const styles = {
        broadLightBottomBorder: {
            borderBottom: '3px solid whitesmoke',
        },
    };

    return (
    <TableRow style={styles.broadLightBottomBorder} selectable={false} >
        <TableRowColumn>
            <div style={{display: 'flex'}}>
                <IdentityIcon id={account.get('id')}/>
                <AccountBalance balance={account.get('balance') || new Wei(0) } withAvatar={true} />
            </div>
        </TableRowColumn>
        <TableRowColumn >
            <AddressAvatar
                secondary={<AccountAddress id={account.get('id')}/>}
                tertiary={account.get('description')}
                primary={account.get('name')}
                onClick={openAccount}
            />
        </TableRowColumn>
        <TableRowColumn style={align.right} >
            <AccountPopup account={account}/>
            <AccountSendButton account={account} />
        </TableRowColumn>
    </TableRow>);
};

Render.propTypes = {
    account: PropTypes.object.isRequired,
    openAccount: PropTypes.func.isRequired,
};

const Account = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
        openAccount: () => {
            const account = ownProps.account;
            log.debug('open', account.get('id'));
            dispatch(gotoScreen('account', account));
        },
    })
)(Render);


export default Account;
