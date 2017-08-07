import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { showDialog } from 'store/screenActions';

const Render = ({ account, handleOpen, backgroundColor = '#EEE', textColor = 'black' }) => {

    const styles = {
        container: {
            display: 'inline',
        },
        openButton: {
            height: '40px',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '1px',
            backgroundColor,
            color: textColor,
        },
    };

    if (!account) {
        return <div style={styles.container}/>;
    }
    return (
        <div style={styles.container}>
            <FlatButton
                label="Add ETC"
                icon={<FontIcon className='fa fa-qrcode' />}
                onClick={() => handleOpen(account)}
                style={styles.openButton}
                 />
        </div>
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
