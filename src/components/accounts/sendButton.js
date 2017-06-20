import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { gotoScreen } from 'store/screenActions';

class AccountSendButtonRender extends React.Component {
    render() {
        const { createTx } = this.props;

        const styles = {
            sendButton: {
                color: 'green',
            },
        };

        return (
        <FlatButton label="SEND"
                    onClick={createTx}
                    icon={<FontIcon className="fa fa-arrow-circle-o-right" />}
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
