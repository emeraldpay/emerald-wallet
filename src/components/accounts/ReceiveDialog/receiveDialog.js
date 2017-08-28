import React from 'react';
import QRCode from 'qrcode.react';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';

import AccountAddress from 'elements/AccountAddress';
import { CloseIcon } from 'elements/Icons';

import classes from './receiveDialog.scss';
import DepositOptions from './DepositOptions';

const styles = {
    address: {
        color: '#191919',
        fontSize: '14px',
        lineHeight: '22px',
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

            <div className={ classes.container }>
                <div>
                    <div className={ classes.title }>Add Ether</div>
                    <div style={{marginTop: '30px' }}>
                        <QRCode value={ address } size={ qrCodeSize }/></div>
                </div>
                <div>
                    <div className={ classes.depositOptionsContainer }>
                        <DepositOptions />
                        <IconButton onTouchTap={ onClose } tooltip="Close">
                            <CloseIcon/>
                        </IconButton>
                    </div>
                    <div style={{marginTop: '30px', marginLeft: '30px'}}>
                        <div className={ classes.headerText }>Top up your wallet with ETC</div>
                        <div>
                            <AccountAddress id={ address } style={ styles.address }/>
                        </div>
                        <div className={ classes.note }>
                            Share your wallet address and use it to top up your wallet with ETC from any other service.
                            It may take some time for your coins be deposited.
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>);
};

export default ReceiveDialog;
