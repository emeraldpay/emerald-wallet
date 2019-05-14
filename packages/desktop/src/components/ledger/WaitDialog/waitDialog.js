import React from 'react';
import {withStyles} from '@material-ui/styles';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import { Close as CloseIcon } from '@emeraldplatform/ui-icons';
import screen from 'store/wallet/screen';
import BackgroundImage from './ledger.png';

export const styles2 = (theme) => ({
  header: {
    background: `url(${BackgroundImage})`,
    backgroundSize: '600px 188px',
    width: '600px',
    height: '188px',
  },
  content: {
    paddingLeft: '30px',
    paddingTop: '14px',
    ol: {
      counterReset: 'mcounter',
      paddingLeft: 0,
    },
    li: {
      listStyle: 'none',
    },
    'li:before': {
      counterIncrement: 'mcounter',
      content: 'counter(mcounter) "."',
      color: '#747474',
      fontSize: '14px',
      lineHeight: '26px',
      display: 'inline-block',
      minWidth: '12px',
      marginRight: '5px',
    },
  },
  title: {
    marginTop: '30px',
    marginBottom: '20px',
    color: '#191919',
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
  links: {
    color: theme.palette.primary.main,
  },
});

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

export const WaitConnectionDialog = ({ onCancel, classes }) => {
  return (
    <Dialog
      modal={ true }
      open={ true }
      bodyClassName={ classes.dialogBody }
      contentClassName={ classes.dialogContent }
      paperClassName={ classes.dialogPaper }
    >
      <div className={ classes.header }>
        <div>
          <IconButton
            style={ style.closeButton }
            onClick={ onCancel }
            tooltip="Close">
            <CloseIcon style={ style.closeIcon }/>
          </IconButton>
        </div>
      </div>
      <div className={ classes.content }>
        <div className={ classes.buyLedger }>
          Ledger Nano S. <a onClick={() => {}} className={classes.links} href="#">Where to buy?</a>
        </div>
        <div className={ classes.title }>
                    Waiting for Ledger Connection...
        </div>
        <div className={ classes.instructions }>
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

const StyledDialog = withStyles(styles2)(WaitConnectionDialog);

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
)(StyledDialog);
