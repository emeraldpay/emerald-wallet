import * as React from 'react';
import { shallow } from 'enzyme';
import OpenWallet from './OpenWallet';

describe('OpenWallet', () => {
  it('renders without crashing', () => {
    const component = shallow(<OpenWallet connectETC={jest.fn} connectETH={jest.fn} />);
    expect(component).toBeDefined();
  });
});
