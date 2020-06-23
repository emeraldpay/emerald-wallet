import { shallow } from 'enzyme';
import * as React from 'react';
import NewMnemonic from './NewMnemonic';

describe('When mnemonic is empty NewMnemonic', () => {
  it('renders Generate button', () => {
    const component = shallow(<NewMnemonic/>);
  });
});
