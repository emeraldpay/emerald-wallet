import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { Provider } from 'react-redux';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import theme from 'emerald-js-ui/src/theme.json';
import 'typeface-rubik/index.css';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import {store, start as startStore} from './store/store';
import Main from './components/layout/Main/main';
import createLogger from './utils/logger';
import About from './containers/About';

import './index.scss';
import './bootstrapButtons.scss';

const log = createLogger('index');

const muiTheme = getMuiTheme(theme);

function start() {
  log.info('Starting Emerald Wallet...');

  // set document background to theme canvas color
  const canvasColor = theme.palette.canvasColor;
  document.body.style.backgroundColor = canvasColor;

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

const showAbout = () => {
  // set document background to theme canvas color
  const canvasColor = theme.palette.alternateTextColor;
  document.body.style.backgroundColor = canvasColor;
  const App = () => (
    <I18nextProvider i18n={i18n}>
      <MuiThemeProvider muiTheme={muiTheme}>
        <About />
      </MuiThemeProvider>
    </I18nextProvider>
  );
  ReactDOM.render(<App />, document.getElementById('app'));
};

window.ETCEMERALD = window.ETCEMERALD || {};
window.ETCEMERALD.start = start;
window.ETCEMERALD.showAbout = showAbout;
