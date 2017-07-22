import React from 'react';
import { connect } from 'react-redux';
import { align, cardSpace } from 'lib/styles';
import {IconButton, FontIcon} from 'material-ui';
import Status from './status/status';
import Total from './total';
import { gotoScreen } from '../../store/screenActions';
import LogoIcon from './logoIcon';


const Render = ({openSettings}) => {

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
                    <div><LogoIcon /></div>
                    <Total/>
                </div>
                <div style={{display: 'flex'}}>
                    <Status />
                        <IconButton onTouchTap={openSettings}>
                            <FontIcon className="fa fa-cog"/>
                        </IconButton>
                </div>
            </div>
        </div>
    );
};

const Header = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
        openSettings: () => {
            dispatch(gotoScreen('settings'));
        },
    })
)(Render);

export default Header;
