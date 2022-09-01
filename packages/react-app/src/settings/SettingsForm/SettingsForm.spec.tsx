import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import * as React from 'react';
import Settings from './SettingsForm';
import { ExportResult } from '../Settings/types';

describe('SettingsForm', () => {
  it('should render without crash', () => {
    const component = render(
      <ThemeProvider theme={Theme}>
        <Settings
          t={() => ''}
          tReady={true}
          currency="RUB"
          hasWallets={true}
          i18n={{} as any}
          language="en-US"
          exportVaultFile={() => Promise.resolve(ExportResult.COMPLETE)}
          goBack={() => undefined}
          isGlobalKeySet={() => Promise.resolve(true)}
          onChangeGlobalKey={() => Promise.resolve(true)}
          onSubmit={async () => undefined}
          showNotification={() => undefined}
        />
      </ThemeProvider>,
      {},
    );

    expect(component).toBeDefined();
  });
});
