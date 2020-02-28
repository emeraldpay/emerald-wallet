import { BlockchainCode, IApi } from '@emeraldwallet/core';
import { mount, shallow } from 'enzyme';
import * as React from 'react';
import AddrList from './AddrList';
import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';

const api: IApi = {
  // @ts-ignore
  emerald: {} as IEmeraldVault,
  chain (name: BlockchainCode | string): any {
  }
};

describe('AddrList', () => {
  it('renders without crashing', () => {
    const component = shallow(<AddrList blockchain={BlockchainCode.ETH} api={api} />);
    expect(component).toBeDefined();
  });

  it('mounts without crash', () => {
    const component = mount(<AddrList blockchain={BlockchainCode.ETH} api={api} />);
    expect(component).toBeDefined();
  });
});
