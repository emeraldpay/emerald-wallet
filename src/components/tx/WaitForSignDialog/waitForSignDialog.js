import React from 'react';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

import screen from 'store/wallet/screen';

const WaitForSignDialog = ({ open, transaction, handleClose }) => {
    const actions = [
        <FlatButton
            label="Cancel"
            primary={true}
            onTouchTap={handleClose}
        />,
    ];

    return (
        <Dialog
            actions={actions}
            modal={false}
            open={open}
            onRequestClose={handleClose}
        >
            Please sign transaction using your Hardware Key<br/>
            <FontIcon className="fa fa-spinner fa-spin"/> Waiting for signature....
        </Dialog>
    );
};

export default connect(
    (state, ownProps) => {
        const dlg = screen.selectors.getCurrentDialog(state);
        return {
            open: dlg.dialog === 'sign-transaction',
            transaction: dlg.dialogItem,
        };
    },
    (dispatch, ownProps) => ({
        handleClose: () => {
        },
    })
)(WaitForSignDialog);

