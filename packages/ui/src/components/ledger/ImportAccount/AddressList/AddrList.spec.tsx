import * as React from 'react';
import { shallow, mount } from 'enzyme';
import AddrList from './AddrList';
import {IApi} from "@emeraldwallet/core";
import {BlockchainCode} from "@emeraldwallet/core";

const api: IApi = {
  emerald: undefined,
  chain(name: BlockchainCode | string): any {
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
