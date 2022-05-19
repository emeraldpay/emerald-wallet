import { render } from '@testing-library/react';
import * as React from 'react';
import { ExportResult } from '../Settings/types';
import Settings from './SettingsForm';

describe('SettingsForm', () => {
  it('should render without crash', () => {
    const component = render(
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
      />,
      {},
    );

    expect(component).toBeDefined();
  });
});
