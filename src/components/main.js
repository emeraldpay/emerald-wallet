import React from 'react'
import AppBar from 'material-ui/AppBar'
import './main.scss'

import AccountsList from './accounts/list'

const Main = () => (
    <div>
        <AppBar
            title="Ethereum Classic Wallet"
            iconClassNameRight="muidocs-icon-navigation-expand-more"
        />
        <div id="body">
            <AccountsList/>
        </div>
        <div id="footer">
            <div>
                Ethereum Classic, 2017 | <a href="https://github.com/ethereumproject/wallet">Fork on GitHub</a>
            </div>
        </div>
    </div>
);

export default Main;