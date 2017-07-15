import React from 'react';
import { connect } from 'react-redux';
import { align, cardSpace } from 'lib/styles';
import {IconButton, FontIcon} from 'material-ui';
import logo from 'images/etc_logo.png';
import Status from './status/status';
import Total from './total';


const Render = () => {
    const style = {
        paddingTop: '20px',
        paddingBottom: '20px',
        cardSpace,
    };
    const titleStyle = {
        color: '#191919',
        fontSize: '17px',
        fontWeight: 500,
        lineHeight: '21px',
        marginRight: '10px',
        fontFamily: 'Poppins',
    };

    return (
        <div style={{backgroundColor: 'white'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', margin: '0 auto', maxWidth: '1060px'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={titleStyle}>EMERALD WALLET</div>
                    <div><img src={logo} height={48}/></div>
                    <Total/>
                </div>
                <div style={{display: 'flex'}}>
                    <Status/>
                    <IconButton><FontIcon className="fa fa-cog"></FontIcon></IconButton>
                </div>
            </div>
        </div>
    );
};

const Header = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({})
)(Render);

export default Header;
