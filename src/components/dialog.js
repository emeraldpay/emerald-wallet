import React from 'react';
import { connect } from 'react-redux';

import { closeDialog } from '../store/wallet/screen/screenActions';
import WaitForSign from './tx/WaitForSignDialog/waitForSignDialog';
import ReceiveDialog from './accounts/ReceiveDialog';
import AboutDialog from './layout/AboutDialog';
import createLogger from '../utils/logger';
import TokensDialog from './tokens/TokensDialog';
import HideAccountDialog from './accounts/HideAccountDialog';
import WaitDialog from './ledger/WaitDialog';

import history from '../store/wallet/history';
import accounts from '../store/vault/accounts';

const log = createLogger('Dialog');

const Dialog = ({ dialog, item, handleClose }) => {
    if (!dialog) {
        return <div/>;
    } else if (dialog === 'sign-transaction') {
        return <WaitForSign/>;
    } else if (dialog === 'receive') {
        return <ReceiveDialog account={ item } onClose= { handleClose }/>;
    } else if (dialog === 'about') {
        return <AboutDialog onClose= { handleClose } />;
    } else if (dialog === 'tokens') {
        return <TokensDialog onClose={ handleClose } />;
    } else if (dialog === 'ledger-wait') {
        return (<WaitDialog onClose={ handleClose }/>);
    } else if (dialog === 'hide-account') {
        return <HideAccountDialog address={ item } onClose={ handleClose } />;
    }
    log.error('Unsupported dialog', dialog);
    return <div/>;
};

export default connect(
    (state, ownProps) => ({
        dialog: state.wallet.screen.get('dialog'),
        item: state.wallet.screen.get('dialogItem'),
    }),
    (dispatch, ownProps) => ({
        handleClose: () => {
            // refresh data when dialogs close
            dispatch(history.actions.refreshTrackedTransactions());
            dispatch(accounts.actions.loadAccountsList());
            dispatch(accounts.actions.loadPendingTransactions());

            dispatch(closeDialog());
        },
    })
)(Dialog);

