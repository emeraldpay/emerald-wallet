import { shallow } from 'enzyme';
import * as React from 'react';
import Settings from './Settings';

describe('Settings', () => {
  it('should render without crash', () => {
    const component = shallow(
      <Settings
        t={(l: string) => ('')}
        currency='RUB'
        language='ru'
        numConfirmations={10}
        showHiddenAccounts={true}
      />);
    expect(component).toBeDefined();
  });
});
