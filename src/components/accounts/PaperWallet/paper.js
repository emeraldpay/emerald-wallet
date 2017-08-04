import React from 'react';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';
import IconButton from 'material-ui/IconButton';
import ActionPrint from 'material-ui/svg-icons/action/print';
import ActionCancel from 'material-ui/svg-icons/navigation/cancel';

import { gotoScreen } from 'store/screenActions';
import { LogoIcon } from '../../../elements/icons';

const styles = {
    main: {
        height: '230px',
        width: '545px',
        border: '1px solid #DDDDDD',
        backgroundColor: '#FFFFFF',
    },
    notes: {
        block: {
            backgroundColor: '#F6F6F6',
            flexGrow: '1',
            marginTop: '5px',
            marginLeft: '20px',
            marginRight: '20px',
            opacity: '0.5',
            color: '#191919',
            fontSize: '9px',
            lineHeight: '24px',
            display: 'flex',
            justifyContent: 'flex-end',
            flexDirection: 'column',
        },
        caption: {
            opacity: '0.5',
            color: '#191919',
            fontSize: '9px',
            lineHeight: '24px',
        },
    },
    header: {
        backgroundColor: '#000000',
        color: '#FFFFFF',
        letterSpacing: '2px',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    body: {
        paddingLeft: '16px',
        paddingRight: '16px',
    },
    addressCaption: {
        lineHeight: '24px',
        fontSize: '12px',
        fontWeight: 500,
    },
};


const PaperWallet = (props) => {
    const { address, privKey, onCancel } = props;

    const Logo = (
        <div style={{minWidth: '33px'}}>
            <div style={{transform: 'rotate(-90deg)' }}>
                <LogoIcon width="17px" height="33px" />
            </div>
        </div>
    );

    const Wallet = (
        <div style={styles.main}>
            <div style={styles.header}>MY EMERALD WALLET</div>
            <div style={styles.body}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div>
                        <div style={styles.addressCaption}>YOUR ADDRESS</div>
                        <div style={{
                            lineHeight: '24px',
                            fontSize: '12px',
                        }}>{address}</div>
                    </div>
                    {Logo}
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div>
                        <QRCode size={100} value={address} />
                    </div>
                    <div style={styles.notes.block}>
                        <div style={styles.notes.caption}>AMOUNT/NOTES</div>
                    </div>
                    <div>
                        <QRCode size={100} value="test" />
                    </div>
                </div>
                <div style={{display: 'flex'}}>
                    {Logo}
                    <div style={{flexGrow: 1}}>
                        <div style={{...styles.addressCaption, textAlign: 'right'}}>
                            YOUR PRIVATE KEY
                        </div>
                        <div style={{
                            lineHeight: '24px',
                            textAlign: 'right',
                            fontSize: '12px',
                        }}>{address}</div>
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
                <IconButton onClick={onCancel}>
                    <ActionCancel />
                </IconButton>
            </div>
        </div>);
};


export default connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
        onCancel: () => {
            dispatch(gotoScreen('home'));
        },
    })
)(PaperWallet);
