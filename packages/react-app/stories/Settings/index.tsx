import { storiesOf } from '@storybook/react';
import i18n from 'i18next';
import * as React from 'react';
import Settings from '../../src/settings/SettingsForm';

storiesOf('Settings', module).add('default', () => (
  <Settings
    i18n={{} as typeof i18n}
    t={(str: string): string => str}
    tReady={true}
    currency="RUB"
    hasWallets={true}
    language="ru"
    exportVaultFile={() => Promise.resolve(null)}
    goBack={() => null}
    isGlobalKeySet={() => Promise.resolve(true)}
    onChangeGlobalKey={() => null}
    onSubmit={() => null}
    showNotification={() => null}
  />
));
