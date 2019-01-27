import React from 'react';
import { Provider } from 'react-redux';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { I18nextProvider } from 'react-i18next';
import theme from 'emerald-js-ui/src/theme.json';
import i18n from '../../i18n/i18n';

import { store } from '../../store/store';
import Main from '../../components/layout/Main/main';

const muiTheme = getMuiTheme(theme);

const App = () => (
  <I18nextProvider i18n={ i18n }>
    <Provider store={ store }>
      <MuiThemeProvider muiTheme={ muiTheme }>
        <Main />
      </MuiThemeProvider>
    </Provider>
  </I18nextProvider>
);

export default App;
