import React from 'react';
import { connect } from 'react-redux'
import log from 'loglevel'

import AccountsList from './accounts/list'
import AccountShow from './accounts/show'
import CreateTx from './tx/create'
import TransactionShow from './tx/show'
import TokensList from './tokens/list'
import Status from './status/status'
import CreateAccount from './accounts/add/add'
import GenerateAccount from './accounts/add/generate'
import ImportAccount from './accounts/add/importjson'

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
                <TokensList/>
                <Status/>
            </div>
        )
    } else if (screen === 'account') {
        return <AccountShow account={screenItem}/>
    } else if (screen === 'transaction') {
        return <TransactionShow transaction={screenItem.transaction} account={screenItem.account}/>
    } else if (screen === 'create-tx') {
        return <CreateTx account={screenItem}/>
    } else if (screen === 'create-account') {
        return <CreateAccount />
    } else if (screen === 'generate') {
        return <GenerateAccount />
    } else if (screen === 'importjson') {
        return <ImportAccount />
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