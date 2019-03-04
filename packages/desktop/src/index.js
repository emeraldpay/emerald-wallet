import React from 'react';
import ReactDOM from 'react-dom';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import theme from 'emerald-js-ui/src/theme.json';
import 'typeface-rubik/index.css';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import {start as startStore} from './store/store';

import createLogger from './utils/logger';
import About from './containers/About';
import App from './containers/App';

const log = createLogger('index');

const muiTheme = getMuiTheme(theme);

function start() {
  log.info('Starting Emerald Wallet...');

  // set document background to theme canvas color
  const { canvasColor } = theme.palette;
  document.body.style.backgroundColor = canvasColor;

  ReactDOM.render(<App />, document.getElementById('app'));

  startStore();
}

const showAbout = () => {
  // set document background to theme canvas color
  const canvasColor = theme.palette.alternateTextColor;
  document.body.style.backgroundColor = canvasColor;
  const AboutWindow = () => (
    <I18nextProvider i18n={i18n}>
      <MuiThemeProvider muiTheme={muiTheme}>
        <About />
      </MuiThemeProvider>
    </I18nextProvider>
  );
  ReactDOM.render(<AboutWindow />, document.getElementById('app'));
};

window.ETCEMERALD = window.ETCEMERALD || {};
window.ETCEMERALD.start = start;
window.ETCEMERALD.showAbout = showAbout;
