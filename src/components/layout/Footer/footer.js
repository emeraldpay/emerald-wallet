import React from 'react';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';

import { showDialog } from '../../../store/screenActions'
import styles from './footer.scss';
import LinkButton from '../../../elements/LinkButton/linkButton'


const Footer = (props) => {
    const { maxWidth = '1220px', handleAbout } = props;

    const footerDiv = {
        paddingLeft: '6px',
        paddingRight: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        margin: '0 auto',
        maxWidth,
    };

    const linkButton = {
        color: '#747474',
        fontWeight: 'normal',
        textTransform: 'none',
    };

    return (
        <div style={ footerDiv }>
            <div className={ styles.leftContainer }>
                <div>Ethereum Classic</div>
                <div><LinkButton href="https://www.etcdevteam.com/support.html" label="Donation" /></div>
            </div>

            <div>
                <FlatButton
                    onClick={ handleAbout }
                    labelStyle={ linkButton }
                    hoverColor="transparent"
                    label="About"
                />
                <FlatButton
                    labelStyle={ linkButton }
                    hoverColor="transparent"
                    label="Help"
                    href="https://github.com/ethereumproject/emerald-wallet" />
                <FlatButton
                    labelStyle={{ ...linkButton }}
                    hoverColor="transparent"
                    label="Support"
                    href="https://github.com/ethereumproject/emerald-wallet" />
             </div>
        </div>
    );
};

export default connect(
    (state, ownProps) => ({
        dialog: state.screen.get('dialog'),
        item: state.screen.get('dialogItem'),
    }),
    (dispatch, ownProps) => ({
        handleAbout: () => {
            dispatch(showDialog('about'));
        },
    })
)(Footer);


