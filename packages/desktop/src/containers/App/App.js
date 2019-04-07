import React from 'react';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/i18n';
import { store } from '../../store/store';
import Main from '../../components/layout/Main/main';

const App = () => (
  <I18nextProvider i18n={ i18n }>
    <Provider store={ store }>
      <Main />
    </Provider>
  </I18nextProvider>
);

export default App;
