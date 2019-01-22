import React from 'react';
import withStyles from 'react-jss';
import QRCode from 'qrcode.react';
import Dialog from 'material-ui/Dialog';
import {Address as AccountAddress} from 'emerald-js-ui';
import CloseButton from 'elements/CloseButton';


export const styles2 = {
  container: {
    display: 'flex',
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
};

const styles = {
  address: {
    color: '#191919',
    fontSize: '14px',
    lineHeight: '22px',
  },
};

const ReceiveDialog = ({ account, onClose, classes }) => {
  const qrCodeSize = 150;
  const address = account.get('id');
  return (
    <Dialog
      modal={ false }
      open={ true }
      onRequestClose={ onClose }>
      <div className={ classes.container }>
        <div>
          <div className={ classes.title }>Add Ether</div>
          <div style={{marginTop: '30px' }}>
            <QRCode value={ address } size={ qrCodeSize }/></div>
        </div>
        <div>
          <div className={ classes.depositOptionsContainer }>
            <CloseButton onClick={ onClose } />
          </div>
          <div style={{marginTop: '30px', marginLeft: '30px'}}>
            <div className={ classes.headerText }>Top up your account with ETC</div>
            <div>
              <AccountAddress id={ address } style={ styles.address }/>
            </div>
            <div className={ classes.note }>
              Share your account address and use it to top up your account with ETC from any other service.
              It may take some time for your coins be deposited.
            </div>
          </div>
        </div>
      </div>
    </Dialog>);
};

export default withStyles(styles2)(ReceiveDialog);
