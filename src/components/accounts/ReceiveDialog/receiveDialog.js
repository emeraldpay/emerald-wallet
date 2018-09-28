import React from 'react';
import QRCode from 'qrcode.react';
import Dialog from 'material-ui/Dialog';
import {Address as AccountAddress} from 'emerald-js-ui';
import CloseButton from 'elements/CloseButton';

import DepositOptions from './DepositOptions';

const styles = {
  address: {
    color: '#191919',
    fontSize: '14px',
    lineHeight: '22px',
  },

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
    color: '#747474',
    marginTop: '16px',
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
    marginLeft: '30px',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};


const ReceiveDialog = ({ account, onClose }) => {
  const qrCodeSize = 150;
  const address = account.get('id');
  return (
    <Dialog
      modal={ false }
      open={ true }
      onRequestClose={ onClose }>
      <div style={ styles.container }>
        <div>
          <div style={ styles.title }>Add Ether</div>
          <div style={{marginTop: '30px' }}>
            <QRCode value={ address } size={ qrCodeSize }/></div>
        </div>
        <div>
          <div style={ styles.depositOptionsContainer }>
            <DepositOptions address={address} />
            <CloseButton onClick={ onClose } />
          </div>
          <div style={{marginTop: '30px', marginLeft: '30px'}}>
            <div style={ styles.headerText }>Top up your account with ETC</div>
            <div>
              <AccountAddress id={ address } style={ styles.address }/>
            </div>
            <div style={ styles.note }>
              Share your account address and use it to top up your account with ETC from any other service.
              It may take some time for your coins be deposited.
            </div>
          </div>
        </div>
      </div>
    </Dialog>);
};

export default ReceiveDialog;
