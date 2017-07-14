import React from 'react';
import { Grid } from 'react-flexbox-grid/lib/index';
import QRCode from 'qrcode.react';
import logo1 from '../../images/logo-1.png';
import logo2 from '../../images/logo-2.png';
import title from '../../images/ether-title.png';
import notes from '../../images/notes-bg.png';

const print = {
    container: {
        width:'680px',
        height:'280px',
        border:'1px solid gray',
        marginBottom:'50px',
        position:'relative',
        background: '#fff',
    },
    title: {
        float: 'left',
        height:'100%',
        width:'auto',
    },
    text: {
        color:'#272b30',
        textTransform:'uppercase',
        letterSpacing:'.05em',
        transform: 'rotate(-90deg)', 
        position:'absolute',
        right:'0',
        bottom:'0',
        fontSize:'13px',
        fontWeight:'600',
    },
    qrCode1: {
        width:'28%',
        float:'left',
        position:'relative',
        padding:'20px',
    },
    text1: {
        right:'-35px',
        bottom:'69px',
    },
    qrCode2: {
        width:'28%',
        float:'left',
        position:'relative',
        padding:'20px',
    },
    text2: {
        right:'-45px',
        bottom:'69px',
    },
    address: {
        float:'left',
        width:'85%',
        padding:'0 25px',
        fontSize:'14px',
        fontFamily:'Menlo,Monaco,Consolas,Courier New,monospace',
        color: '#272b30',
    },
    logo1: {
        position:'absolute',
        left:'100px',
        height:'100%',
        width:'auto',
    },
    logo2: {
        position:'absolute',
        right:'32px',
        bottom:'64px',
    },
    notes: {
      width:'90%', 
      height:'auto',
      float: 'left',
    }
}

const PaperWallet = (props) => {
    const { address, privKey } = props;

    return (
        <Grid style={print.container}>
            <img src={logo1} style={print.logo1} />
            <img src={logo2} style={print.logo2} />
            <img src={title} style={print.title} />
            <div style={print.qrCode1}>
                <QRCode value={address} level="H" />
                <p style={Object.assign(print.text,print.text1)}>YOUR ADDRESS</p>
            </div>
            <div style={print.qrCode2}>
                <img src={notes} style={print.notes} />
                <p style={Object.assign(print.text,print.text2)}>AMOUNT / NOTES</p>
            </div>
            <div style={print.qrCode2}>
                <QRCode value="test" level="Q" />
                <p style={Object.assign(print.text,print.text2)}>YOUR PRIVATE KEY</p>
            </div>
            <div style={print.address}>
                <p><strong>Your Address:</strong><br />{address}</p>          
                <p><strong>Your Private Key:</strong><br />{privKey}</p>
            </div>
        </Grid>
    );
}

export default PaperWallet;
