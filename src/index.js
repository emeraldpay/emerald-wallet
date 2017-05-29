import React from 'react';
import { Provider, connect } from 'react-redux'
import 'font-awesome/scss/font-awesome.scss'
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Main from './components/main';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {store, start as startStore} from './store/store.js';
import log from 'loglevel';
import 'roboto-fontface/css/roboto/sass/roboto-fontface.scss'
import './index.scss'

function start() {
    log.setLevel('debug');
    log.info("Starting Emerald Wallet...");

    // Needed for onTouchTap
    injectTapEventPlugin();

    const App = () => (
        <I18nextProvider i18n={ i18n }>
            <Provider store={store}>
                <MuiThemeProvider>
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
