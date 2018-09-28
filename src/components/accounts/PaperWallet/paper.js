import React from 'react';
import QRCode from 'qrcode.react';
import IconButton from 'material-ui/IconButton';
import ActionPrint from 'material-ui/svg-icons/action/print';
import ActionCancel from 'material-ui/svg-icons/navigation/cancel';

import { LogoIcon } from '../../../elements/Icons';

const styles = {
  container: {
    height: '230px',
    width: '545px',
    border: '1px solid #DDDDDD',
    backgroundColor: '#FFFFFF',
  },

  addressLabel: {
    lineHeight: '24px',
    fontSize: '12px',
    fontWeight: '500',
  },

  addressValue: {
    lineHeight: '24px',
    fontSize: '12px',
  },

  privateLabel: {
    lineHeight: '24px',
    fontSize: '12px',
    fontWeight: '500',
    textAlign: 'right',
  },

  privateValue: {
    lineHeight: '24px',
    textAlign: 'right',
    fontSize: '12px',
  },

  title: {
    backgroundColor: '#000000',
    letterSpacing: '2px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
  },

  main: {
    paddingLeft: '16px',
    paddingRight: '16px',
  },

  addressBlock: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  qrCodesBlock: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  privateBlock: {
    display: 'flex',
  },

  notes: {
    backgroundColor: '#F6F6F6',
    flexGrow: '1',
    marginTop: '5px',
    marginLeft: '20px',
    marginRight: '20px',
    justifyContent: 'flex-end',
    flexDirection: 'column',
    display: 'flex',
  },

  notesCaption: {
    opacity: '0.5',
    color: '#191919',
    fontSize: '9px',
    lineHeight: '24px',
  },

  logoContainer: {
    minwidth: '33px',
  },

  logoIcon: {
    transform: 'rotate(-90deg)',
  },

};

export const PaperWallet = (props) => {
  const { address, privKey, onCancel } = props;

  const Logo = (
    <div style={styles.logoContainer}>
      <div style={styles.logoIcon }>
        <LogoIcon width="17px" height="33px" />
      </div>
    </div>
  );

  const Wallet = (
    <div style={styles.container}>
      <div style={styles.title}>MY EMERALD WALLET</div>
      <div style={styles.main}>
        <div style={styles.addressBlock}>
          <div>
            <div style={styles.addressLabel}>YOUR ADDRESS</div>
            <div style={styles.addressValue}>{ address }</div>
          </div>
          {Logo}
        </div>
        <div style={styles.qrCodesBlock}>
          <div>
            <QRCode size={100} value={ address } />
          </div>
          <div style={styles.notes}>
            <div style={styles.notesCaption}>AMOUNT/NOTES</div>
          </div>
          <div>
            <QRCode size={100} value={ privKey } />
          </div>
        </div>
        <div style={styles.privateBlock}>
          {Logo}
          <div style={{flexGrow: 1}}>
            <div style={styles.privateLabel}>YOUR PRIVATE KEY</div>
            <div style={styles.privateValue}>{ privKey }</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div>{Wallet}</div>
      <div>
        <IconButton onClick={() => window.print()}>
          <ActionPrint />
        </IconButton>
        <IconButton onClick={ onCancel }>
          <ActionCancel />
        </IconButton>
      </div>
    </div>);
};

export default PaperWallet;
