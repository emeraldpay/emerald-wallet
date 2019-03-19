import * as React from 'react';
import { shallow } from 'enzyme';
import OpenWallet from './OpenWallet';

describe('OpenWallet', () => {
  it('renders without crashing', () => {
    const component = shallow(<OpenWallet />);
    expect(component).toBeDefined();
  });
});
