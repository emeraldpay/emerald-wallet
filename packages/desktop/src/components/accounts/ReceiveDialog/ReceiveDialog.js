import React from 'react';
import withStyles from 'react-jss';
import QRCode from 'qrcode.react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import {Address as AccountAddress} from '@emeraldplatform/ui';
import {MuiThemeProvider} from '@material-ui/core/styles';
import theme from '@emeraldplatform/ui/lib/theme';
import CloseButton from 'components/common/CloseButton';

export const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#191919',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '24px',
    paddingTop: '12px',
    paddingBottom: '12px',
    textTransform: 'uppercase',
  },
  note: {
    marginTop: '16px',
    color: '#747474',
    fontSize: '14px',
    lineHeight: '22px',
  },
  headerText: {
    color: '#191919',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '24px',
  },
  depositOptionsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  closeButton: {
    float: 'right',
  },
  address: {
    color: '#191919',
    fontSize: '14px',
    lineHeight: '22px',
  },
  dialogContentRoot: {
    padding: '0 15px 15px 15px',
  },
};

const ReceiveDialog = ({account, onClose, classes}) => {
  const qrCodeSize = 150;
  const address = account.get('id');
  return (
    <MuiThemeProvider theme={theme}>
      <Dialog open={true} onClose={onClose}>
        <DialogContent classes={{root: classes.dialogContentRoot}}>
          <div className={classes.container}>
            <div className={classes.title}>Add Ether</div>
            <div>
              <CloseButton className={classes.closeButton} onClick={onClose}/>
            </div>
          </div>
          <div className={classes.container}>
            <div style={{marginTop: '30px', marginRight: '15px'}}>
              <QRCode value={address} size={qrCodeSize}/>
            </div>
            <div style={{marginTop: '0px'}}>
              <div className={classes.headerText}>Top up your account with ETC</div>
              <div className={classes.address}>
                <AccountAddress id={address}/>
              </div>
              <div className={classes.note}>
                Share your account address and use it to top up your account with ETC from any other service.
                It may take some time for your coins be deposited.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MuiThemeProvider>);
};

export default withStyles(styles)(ReceiveDialog);
