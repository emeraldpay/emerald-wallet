import { storiesOf } from '@storybook/react';
import i18n from 'i18next';
import * as React from 'react';
import { ExportResult } from '../../src/settings/Settings/types';
import Settings from '../../src/settings/SettingsForm';

storiesOf('Settings', module).add('default', () => (
  <Settings
    tReady={true}
    currency="RUB"
    hasWallets={true}
    i18n={{} as typeof i18n}
    language="ru"
    seeds={[]}
    t={(str: string): string => str}
    exportVaultFile={() => Promise.resolve(ExportResult.COMPLETE)}
    goBack={() => null}
    isGlobalKeySet={() => Promise.resolve(true)}
    onChangeGlobalKey={() => Promise.resolve(true)}
    onSubmit={() => Promise.resolve()}
    showNotification={() => null}
    updateSeed={() => Promise.resolve(true)}
  />
));
