import React from 'react';
import QRCode from 'qrcode.react';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import AccountAddress from 'elements/AccountAddress';

import { CloseIcon } from 'elements/Icons';

import classes from './receiveDialog.scss';

const styles = {

    usageText: {
        color: 'gray',
    },
    usageWarning: {
        color: 'crimson',
        fontSize: '0.9rem',
    },
    accountId: {
        overflow: 'scroll',
        backgroundColor: 'whitesmoke',
        padding: '0.1rem 0.3rem',
        display: 'inline',
        fontSize: '0.8rem', /* to better ensure fit for all screen sizes */
    },
    address: {
        color: '#191919',
        fontSize: '14px',
        lineHeight: '22px',
    },
};


const ReceiveDialog = ({account, onClose}) => {
    return (
        <Dialog
            modal={ false }
            open={ true }
            onRequestClose={ onClose }>

            <div className={ classes.container }>
                <div>
                    <div className={ classes.title }>Add Ether</div>
                    <div><QRCode value={account.get('id')} size={150}/></div>
                </div>
                <div>
                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <IconButton
                            onTouchTap={ onClose }
                            tooltip="Close">
                            <CloseIcon/>
                        </IconButton>
                    </div>
                    <div style={{marginLeft: '30px'}}>
                        <div className={ classes.headerText }>Top up your wallet with ETC</div>
                        <div>
                            <AccountAddress id={ account.get('id') } style={ styles.address }/>
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
