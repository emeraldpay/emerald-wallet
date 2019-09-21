import { Close as CloseIcon } from '@emeraldplatform/ui-icons';
import { Dialog, IconButton } from '@material-ui/core';
import { CSSProperties, withStyles } from '@material-ui/styles';
import * as React from 'react';
import * as BackgroundImage from './ledger.png';

export const styles2 = (theme?: any) => ({
  header: {
    background: `url(${BackgroundImage})`,
    backgroundSize: '600px 188px',
    width: '600px',
    height: '188px'
  },
  content: {
    'paddingLeft': '30px',
    'paddingTop': '14px',
    'ol': {
      counterReset: 'mcounter',
      paddingLeft: 0
    },
    'li': {
      listStyle: 'none'
    },
    'li:before': {
      counterIncrement: 'mcounter',
      content: 'counter(mcounter) "."',
      color: '#747474',
      fontSize: '14px',
      lineHeight: '26px',
      display: 'inline-block',
      minWidth: '12px',
      marginRight: '5px'
    }
  },
  title: {
    marginTop: '30px',
    marginBottom: '20px',
    color: '#191919',
    fontSize: '22px',
    lineHeight: '24px'
  },
  buyLedger: {
    color: '#747474',
    fontSize: '14px',
    lineHeight: '22px'
  },
  instructions: {
    color: '#191919',
    fontSize: '14px',
    lineHeight: '22px'
  },
  dialogBody: {
    padding: '0 !important'
  },
  dialogContent: {
    maxWidth: '600px !important'
  },
  dialogPaper: {
    backgroundColor: 'white !important'
  },
  links: {
    color: theme.palette.primary.main
  },
  closeButton: {
    float: 'right'
  } as CSSProperties
});

const style = {
  closeButton: {
    float: 'right'
  },
  closeIcon: {
    width: '15px',
    height: '15px',
    color: 'white'
  }
};

interface Props {
  onClose?: any;
  classes?: any;
}

export const WaitConnectionDialog = ({ onClose, classes }: Props) => {
  return (
    <Dialog open={true}>
      <div className={classes.header}>
        <div>
          <IconButton
            className={classes.closeButton}
            onClick={onClose}>
            <CloseIcon style={style.closeIcon}/>
          </IconButton>
        </div>
      </div>
      <div className={classes.content}>
        <div className={classes.buyLedger}>
          Ledger Nano S. <a className={classes.links} href='#'>Where to buy?</a>
        </div>
        <div className={classes.title}>
          Waiting for Ledger Connection...
        </div>
        <div className={classes.instructions}>
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

export default withStyles(styles2)(WaitConnectionDialog);
