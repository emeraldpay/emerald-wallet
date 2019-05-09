import * as React from 'react';
import { shallow, mount } from 'enzyme';
import AddrList from './AddrList';

describe('AddrList', () => {
  it('renders without crashing', () => {
    const component = shallow(<AddrList />);
    expect(component).toBeDefined();
  });

  it('mounts without crash', () => {
    const component = mount(<AddrList />);
    expect(component).toBeDefined();
  });
});
