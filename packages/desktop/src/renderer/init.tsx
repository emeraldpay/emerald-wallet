import { Logger, config } from '@emeraldwallet/core';
import { App, i18n } from '@emeraldwallet/react-app';
import { Theme } from '@emeraldwallet/ui';
import BigNumber from 'bignumber.js';
import * as ElectronLogger from 'electron-log';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { AboutComponent } from './components/About';
import { startStore, store } from './store';

Logger.setInstance(ElectronLogger);

const log = Logger.forCategory('Init');

window.addEventListener('unhandledrejection ', (error) => log.error('Uncaught promise rejection:', error));

declare global {
  interface Window {
    EMERALD: {
      start(): void;
      showAbout(): void;
    };
  }
}

function start(): void {
  log.info('Starting Emerald Wallet...');

  document.body.style.backgroundColor = Theme.palette.background.default;

  ReactDOM.render(<App store={store} terms={config.TERMS_VERSION} />, document.getElementById('app'));

  startStore();
}

function showAbout(): void {
  document.body.style.backgroundColor = Theme.palette.background.default;

  const AboutWindow: React.FC = () => (
    <I18nextProvider i18n={i18n}>
      <AboutComponent />
    </I18nextProvider>
  );

  ReactDOM.render(<AboutWindow />, document.getElementById('app'));
}

BigNumber.config({ EXPONENTIAL_AT: 27 });

window.EMERALD = { start, showAbout };
