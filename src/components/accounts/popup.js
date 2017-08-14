import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from 'elements/Form/Button';
import FontIcon from 'material-ui/FontIcon';
import { showDialog } from 'store/screenActions';

const Render = ({ account, handleOpen, primary }) => {
    if (!account) {
        return null;
    }
    return (
            <Button primary={ primary }
                label="Add ETC"
                icon={<FontIcon className='fa fa-qrcode' />}
                onClick={() => handleOpen(account)}
                 />
    );
};

Render.propTypes = {
    account: PropTypes.object,
    handleOpen: PropTypes.func.isRequired,
};

const AccountPopup = connect(
    (state, ownProps) => {
        const accounts = state.accounts.get('accounts');
        const pos = accounts.findKey((acc) => acc.get('id') === ownProps.account.get('id'));
        return {
            account: accounts.get(pos),
        };
    },
    (dispatch, ownProps) => ({
        handleOpen: (account) => {
            dispatch(showDialog('receive', account));
        },
    })
)(Render);

export default AccountPopup;
