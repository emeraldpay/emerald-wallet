import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';

import log from 'loglevel';
import { accountPopupOpen } from 'store/accountActions';

const TokenRow = ({ token }) => {
    const balance = token.get('balance') ? token.get('balance').getDecimalized() : '0';

    return (
        <div><span>{balance} {token.get('symbol')}</span></div>
    );
};
TokenRow.propTypes = {
    token: PropTypes.object.isRequired,
};

const Render = ({ account, handleOpenAccountDialog }) => (
    <RaisedButton label="Add ETC"
            icon={<FontIcon className="fa fa-qrcode"/>}
            onTouchTap={handleOpenAccountDialog(account)} />
);

Render.propTypes = {
    account: PropTypes.object.isRequired,
    handleOpenAccountDialog: PropTypes.func.isRequired,
};

const AccountPopupButton = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
        handleOpenAccountDialog: (account) => {
            log.debug('popup open', account);
            dispatch(accountPopupOpen(account));
        },
    })
)(Render);

export default AccountPopupButton;
