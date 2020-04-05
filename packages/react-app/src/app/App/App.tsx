import { Theme } from '@emeraldplatform/ui';
import { ThemeProvider } from '@material-ui/core/styles';
import * as React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import ErrorDialog from '../../common/ErrorDialog';
import i18n from '../../i18n';
import ConnectionStatus from '../layout/ConnectionStatus';
import Header from '../layout/Header';
import NotificationBar from '../layout/NotificationBar';
import Dialog from '../screen/Dialog';
import Screen from '../screen/Screen';

const maxWidth = '1150px';
const App = (props: any) => (
  <I18nextProvider i18n={i18n}>
    <Provider store={props.store}>
      <ThemeProvider theme={Theme}>
        <div style={{ height: '100%', backgroundColor: Theme.palette.background.default }} className='application'>
          {props.store.getState().screen.get('screen') !== 'paper-wallet' && <Header/>}
          <div style={{ margin: '20px auto', maxWidth }}>
            <Screen termsVersion={props.terms}/>
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
