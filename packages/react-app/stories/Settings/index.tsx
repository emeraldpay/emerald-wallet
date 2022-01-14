import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Settings from '../../src/settings/SettingsForm';

storiesOf('Settings', module)
  .add('default', () => (
    <Settings
      i18n={{} as any}
      tReady={true}
      t={(str: any): any => (
        str
      )}
      currency="RUB"
      language="ru"
    />
  ));
