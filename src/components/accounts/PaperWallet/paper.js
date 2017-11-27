import React from 'react';
import QRCode from 'qrcode.react';
import IconButton from 'material-ui/IconButton';
import ActionPrint from 'material-ui/svg-icons/action/print';
import ActionCancel from 'material-ui/svg-icons/navigation/cancel';

import { LogoIcon } from '../../../elements/Icons';

import styles from './paper.scss';


export const PaperWallet = (props) => {
  const { address, privKey, onCancel } = props;

  const Logo = (
    <div className={styles.logoContainer}>
      <div className={styles.logoIcon }>
        <LogoIcon width="17px" height="33px" />
      </div>
    </div>
  );

  const Wallet = (
    <div className={styles.container}>
      <div className={styles.title}>MY EMERALD WALLET</div>
      <div className={styles.main}>
        <div className={styles.addressBlock}>
          <div>
            <div className={styles.addressLabel}>YOUR ADDRESS</div>
            <div className={styles.addressValue}>{ address }</div>
          </div>
          {Logo}
        </div>
        <div className={styles.qrCodesBlock}>
          <div>
            <QRCode size={100} value={ address } />
          </div>
          <div className={styles.notes}>
            <div className={styles.notesCaption}>AMOUNT/NOTES</div>
          </div>
          <div>
            <QRCode size={100} value={ privKey } />
          </div>
        </div>
        <div className={styles.privateBlock}>
          {Logo}
          <div style={{flexGrow: 1}}>
            <div className={styles.privateLabel}>YOUR PRIVATE KEY</div>
            <div className={styles.privateValue}>{ privKey }</div>
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
