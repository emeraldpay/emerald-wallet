import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { gotoScreen } from 'store/screenActions';

class AccountSendButtonRender extends React.Component {
    render() {
        const { createTx } = this.props;

        const backgroundColor = this.props.backgroundColor ? this.props.backgroundColor : '#EEE';
        const textColor = this.props.textColor ? this.props.textColor : 'black';

        const styles = {
            sendButton: {
                height: '40px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '1px',
                backgroundColor,
                color: textColor,
                marginLeft: '10px',
            },
        };

        return (
        <FlatButton label="SEND"
                    onClick={createTx}
                    style={styles.sendButton} />
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
