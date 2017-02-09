import React from 'react';
import { Provider, connect } from 'react-redux'
import 'font-awesome/scss/font-awesome.scss'
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Main from './components/main';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {store} from './store/store.js';
import log from 'loglevel';
import 'roboto-fontface/css/roboto/sass/roboto-fontface.scss'
import './index.scss'

log.setLevel('debug');
log.info("Starting ETC Wallet...");
// Needed for onTouchTap
injectTapEventPlugin();

const App = () => (
    <Provider store={store}>
        <MuiThemeProvider>
            <Main />
        </MuiThemeProvider>
    </Provider>
);

ReactDOM.render(<App />, document.getElementById('app'));
