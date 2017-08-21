import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from 'elements/Form/Button';
import { gotoScreen } from 'store/screenActions';

class AccountSendButtonRender extends React.Component {
    render() {
        const { createTx, primary, style } = this.props;
        const styles = {
            sendButton: {

            },
        };

        return (
            <Button primary={ primary } style={ style } label="SEND" onClick={ createTx } />
        );
    }
}

AccountSendButtonRender.propTypes = {
    account: PropTypes.object.isRequired,
    createTx: PropTypes.func.isRequired,
};

const AccountSendButton = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
        createTx: () => {
            const account = ownProps.account;
            dispatch(gotoScreen('create-tx', account));
        },
    })
)(AccountSendButtonRender);

export default AccountSendButton;
