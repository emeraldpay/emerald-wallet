import { render } from '@testing-library/react';
import * as React from 'react';
import Settings from './Settings';

describe('SettingsForm', () => {
  it('should render without crash', () => {
    const component = render(
      <Settings
        i18n={{} as any}
        tReady={true}
        t={(l: string) => ('')}
        currency='RUB'
        language='en-US'
        numConfirmations={10}
        showHiddenAccounts={true}
      />
      );
    expect(component).toBeDefined();
  });
});
