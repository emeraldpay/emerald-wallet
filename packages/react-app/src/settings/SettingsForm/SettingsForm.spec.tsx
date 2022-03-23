import { render } from '@testing-library/react';
import * as React from 'react';
import Settings from './SettingsForm';

describe('SettingsForm', () => {
  it('should render without crash', () => {
    const component = render(
      <Settings
        currency="RUB"
        i18n={{} as any}
        language="en-US"
        t={() => ''}
        tReady={true}
        goBack={() => undefined}
        onChangeGlobalKey={() => Promise.resolve(true)}
        onSubmit={async () => undefined}
        showNotification={() => undefined}
      />,
    );
    expect(component).toBeDefined();
  });
});
