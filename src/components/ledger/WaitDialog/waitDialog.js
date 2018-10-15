import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import { Close as CloseIcon } from 'emerald-js-ui/lib/icons3';
import screen from 'store/wallet/screen';

import styles from './waitDialog.scss';

const style = {
  closeButton: {
    float: 'right',
  },
  closeIcon: {
    width: '15px',
    height: '15px',
    color: 'white',
  },
};

export const WaitConnectionDialog = ({ onCancel }) => {
  return (
    <Dialog
      modal={ true }
      open={ true }
      bodyClassName={ styles.dialogBody }
      contentClassName={ styles.dialogContent }
      paperClassName={ styles.dialogPaper }
    >
      <div className={ styles.header }>
        <div>
          <IconButton
            style={ style.closeButton }
            onTouchTap={ onCancel }
            iconStyle={ style.closeIcon }
            tooltip="Close">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <div className={ styles.content }>
        <div className={ styles.buyLedger }>
                    Ledger Nano S. Where to buy?
        </div>
        <div className={ styles.title }>
                    Waiting for Ledger Connection...
        </div>
        <div className={ styles.instructions }>
          <ol>
            <li>Connect your Ledger Nano S device</li>
            <li>Open the Ethereum Application on Ledger device</li>
            <li>Check that Browser Mode is switched Off</li>
          </ol>
        </div>
      </div>
    </Dialog>
  );
};

WaitConnectionDialog.propTypes = {
  onCancel: PropTypes.func,
};

export default connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({
    onCancel: () => {
      if (ownProps.onClose) {
        ownProps.onClose();
      } else {
        dispatch(screen.actions.gotoScreen('home'));
      }
    },
  })
)(WaitConnectionDialog);
