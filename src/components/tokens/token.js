import React from 'react';
import { connect } from 'react-redux'
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import StarBorder from 'material-ui/svg-icons/toggle/star-border';

import { gotoScreen } from '../../store/screenActions'
import log from 'loglevel'
import { link } from '../../lib/styles'

const shortStyle = { width: 12 };
const wideStyle = { width: 120 };

const Render = ({token, openToken}) => {
    return (
        <GridTile
          title={token.get('name')}
          subtitle={<span>
            {token.get('total') ? token.get('total').getDecimalized() : '?'}
                    <b> {token.get('symbol')}</b></span>
                }
          actionIcon={<IconButton><StarBorder color="white" /></IconButton>}
        >
          <span onClick={openToken} style={link}>
            {token.get('id')}
          </span>
        </GridTile>
    );
};

const Token = connect(
    (state, ownProps) => {
        return {}
    },
    (dispatch, ownProps) => {
        return {
            openToken: () => {
                const token = ownProps.token;
                log.debug('open', token.get('id'));
                //dispatch(gotoScreen('token', token))
            }
        }
    }
)(Render);


export default Token