import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { DescriptionList, DescriptionTitle, DescriptionData } from 'elements/dl';
import { link, align, cardSpace, copyIcon } from 'lib/styles';
import { Wei } from 'lib/types';
import { AccountAddress } from 'elements/dl';
import { showDialog } from 'store/screenActions';

const styles = {
    container: {
        display: 'inline',
    },
    openButton: {
        height: '40px',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '1px',
        backgroundColor: '#EEE',
    },
};

const Render = ({ account, handleOpen }) => {
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
    handleOpen: PropTypes.func.isRequired
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
        }
    })
)(Render);

export default AccountPopup;
