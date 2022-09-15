import { Theme } from '@emeraldwallet/ui';
import { createStyles } from '@material-ui/core';
import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import ErrorDialog from '../../common/ErrorDialog';
import i18n from '../../i18n';
import ConnectionStatus from '../layout/ConnectionStatus';
import Header from '../layout/Header';
import NotificationBar from '../layout/NotificationBar';
import Dialog from '../screen/Dialog';
import Screen from '../screen/Screen';

const useStyles = makeStyles((theme) =>
  createStyles({
    application: {
      backgroundColor: theme.palette.background.default,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    },
    screen: {
      flex: 1,
      margin: '0 auto',
      maxWidth: 1150,
      overflow: 'hidden',
      padding: 20,
      width: '100%',
    },
  }),
);

interface OwnProps {
  store: Store;
  terms: string;
}

const App: React.FC<OwnProps> = ({ store, terms }) => {
  const styles = useStyles();

  const state = store.getState();

  return (
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <ThemeProvider theme={Theme}>
          <div className={styles.application}>
            {state.screen.screen !== 'paper-wallet' && <Header />}
            <div className={styles.screen}>
              <Screen termsVersion={terms} />
            </div>
            <ErrorDialog />
            <NotificationBar />
            <Dialog />
            <ConnectionStatus />
          </div>
        </ThemeProvider>
      </Provider>
    </I18nextProvider>
  );
};

export default App;
