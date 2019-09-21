import { IApi } from '@emeraldwallet/core';
import { BlockchainCode } from '@emeraldwallet/core';
import { mount, shallow } from 'enzyme';
import * as React from 'react';
import AddrList from './AddrList';

const api: IApi = {
  emerald: undefined,
  chain (name: BlockchainCode | string): any {
  }
};

describe('AddrList', () => {
  it('renders without crashing', () => {
    const component = shallow(<AddrList api={api} />);
    expect(component).toBeDefined();
  });

  it('mounts without crash', () => {
    const component = mount(<AddrList api={api} />);
    expect(component).toBeDefined();
  });
});
