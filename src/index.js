import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import log from 'electron-log';
import 'font-awesome/scss/font-awesome.scss';
import 'typeface-rubik';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {store, start as startStore} from './store/store.js';
import Main from './components/layout/Main/main';

import './index.scss';
import './bootstrapButtons.scss';

const muiTheme = getMuiTheme({
    fontFamily: 'Rubik',
});

function start() {
    // log.transports.console.level = 'debug';
    log.info('Starting Emerald Wallet...');

    // Needed for onTouchTap
    injectTapEventPlugin();

    const App = () => (
        <I18nextProvider i18n={ i18n }>
            <Provider store={store}>
                <MuiThemeProvider muiTheme={muiTheme}>
                    <Main />
                </MuiThemeProvider>
            </Provider>
        </I18nextProvider>
    );

    ReactDOM.render(<App />, document.getElementById('app'));

    startStore();
}

window.ETCEMERALD = window.ETCEMERALD || {};
window.ETCEMERALD.start = start;
