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
    language="ru"
    goBack={() => null}
    onChangeGlobalKey={() => null}
    onSubmit={() => null}
    showNotification={() => null}
  />
));
