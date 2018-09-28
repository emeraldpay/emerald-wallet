import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import { Close as CloseIcon } from 'emerald-js-ui/lib/icons3';
import screen from 'store/wallet/screen';

const styles = {
  closeButton: {
    float: 'right',
  },
  closeIcon: {
    width: '15px',
    height: '15px',
    color: 'white',
  },
  header: {
    background: 'url("./ledger.png")',
    backgroundSize: '600px 188px',
    width: '600px',
    height: '188px',
  },

  content: {
    paddingLeft: '30px',
    paddingTop: '14px',
  },

  title: {
    color: '#191919',
    marginTop: '30px',
    marginBottom: '20px',
    fontSize: '22px',
    lineHeight: '24px',
  },

  buyLedger: {
    color: '#747474',
    fontSize: '14px',
    lineHeight: '22px',
  },

  instructions: {
    color: '#191919',
    fontSize: '14px',
    lineHeight: '22px',
  },

  dialogBody: {
    padding: '0 !important',
  },

  dialogContent: {
    maxWidth: '600px !important',
  },

  dialogPaper: {
    backgroundColor: 'white !important',
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
      <div style={ styles.header }>
        <div>
          <IconButton
            style={ styles.closeButton }
            onTouchTap={ onCancel }
            iconStyle={ styles.closeIcon }
            tooltip="Close">
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <div style={ styles.content }>
        <div style={ styles.buyLedger }>
                    Ledger Nano S. Where to buy?
        </div>
        <div style={ styles.title }>
                    Waiting for Ledger Connection...
        </div>
        <div style={ styles.instructions }>
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
