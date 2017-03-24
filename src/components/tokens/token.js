import React from 'react';
import { connect } from 'react-redux'
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';

import { gotoScreen } from '../../store/screenActions'
import log from 'loglevel'
import { link } from '../../lib/styles'

const Render = ({token, openToken}) => {

    const nameStyle = {
        fontSize: "20px",
      }

    return (
        <GridTile
          onClick={openToken}
          style={link}
          subtitle={token.get('id')}
          title={<span>
            {token.get('total') ? token.get('total').getDecimalized() : '?'}
                    <b> {token.get('symbol')}</b></span>
                }
        >
          <span style={nameStyle}>
            {token.get('name')}
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
                console.log('TODO: This will go to a screen for interacting with token contract')
                //dispatch(gotoScreen('token', token))
            }
        }
    }
)(Render);


export default Token