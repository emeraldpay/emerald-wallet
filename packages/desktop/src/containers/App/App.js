import React from 'react';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { Theme } from '@emeraldplatform/ui';
import { ErrorDialog} from '@emeraldwallet/react-app';
import { ThemeProvider } from '@material-ui/styles';

import Header from '../../components/layout/Header';
import NotificationBar from '../../components/layout/NotificationBar';
import ConnectionStatus from '../../components/layout/ConnectionStatus';

import Screen from '../Screen';
import Dialog from '../Dialog';

import i18n from '../../i18n/i18n';
import { store } from '../../store/store';

const maxWidth = '1150px';

const App = () => (
  <I18nextProvider i18n={ i18n }>
    <Provider store={ store }>
      <ThemeProvider theme={ Theme }>
        <div style={{height: '100%', backgroundColor: Theme.palette.background.default}} className="application">
          {store.getState().screen.get('screen') !== 'paper-wallet' && <Header/>}
          <div style={{margin: '20px auto', maxWidth}}>
            <Screen />
          </div>
          <ErrorDialog/>
          <NotificationBar/>
          <Dialog/>
          <ConnectionStatus/>
        </div>
      </ThemeProvider>
    </Provider>
  </I18nextProvider>
);

export default App;
