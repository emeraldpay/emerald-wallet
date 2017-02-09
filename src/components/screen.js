import React from 'react';
import { connect } from 'react-redux'
import log from 'loglevel'

import AccountsList from './accounts/list'
import AccountShow from './accounts/show'

import Status from './status/status'

const Render = ({screen, screenItem}) => {

    log.debug('screen', screen);

    if (screen === null) {
        return <div>
            <i className="fa fa-spinner fa-spin fa-2x" /> Initializing...
        </div>
    } else if (screen === 'home') {
        return (
            <div>
                <AccountsList/>
                <Status/>
            </div>
        )
    } else if (screen === 'account') {
        return <AccountShow account={screenItem}/>
    }

    return (
        <div>
            Unknown screen
        </div>
    )
};

const Screen = connect(
    (state, ownProps) => {
        return {
            screen: state.screen.get('screen'),
            screenItem: state.screen.get('item')
        }
    },
    (dispatch, ownProps) => {
        return {}
    }
)(Render);

export default Screen