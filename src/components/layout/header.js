import React from 'react';
import { connect } from 'react-redux';
import { align, cardSpace } from 'lib/styles';
import {Toolbar, ToolbarGroup, IconButton, FontIcon, FlatButton} from 'material-ui';
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
        fontFamily: 'Poppins Medium',
    };

    return (
        <Toolbar style={{backgroundColor: '#FFFFFF', height: '64px'}}>
            <ToolbarGroup>
                <div style={titleStyle}>
                    EMERALD WALLET
                </div>
                <div><img src={logo} height={33}/></div>
                <Total/>
            </ToolbarGroup>
            <ToolbarGroup>
                <Status/>

                <IconButton><FontIcon className="fa fa-cog"></FontIcon></IconButton>
            </ToolbarGroup>
        </Toolbar>
    );
};

const Header = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({})
)(Render);

export default Header;
