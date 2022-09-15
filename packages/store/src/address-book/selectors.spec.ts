import { BlockchainCode } from '@emeraldwallet/core';
import * as selectors from './selectors';
import { moduleName } from './types';
import { IState } from '../types';

describe('all', () => {
  const state: Partial<IState> = {
    [moduleName]: {
      contacts: {
        [BlockchainCode.ETC]: [
          {
            address: { type: 'plain', address: '0x123' },
            label: 'name1',
            blockchain: 101,
            createTimestamp: new Date(),
          },
        ],
        [BlockchainCode.ETH]: [
          {
            address: { type: 'plain', address: '0x222' },
            label: 'name2',
            blockchain: 100,
            createTimestamp: new Date(),
          },
          {
            address: { type: 'plain', address: '0x333' },
            label: 'name3',
            blockchain: 100,
            createTimestamp: new Date(),
          },
        ],
      },
    },
  };

  it('should return array of contacts', () => {
    const result = selectors.all(state as IState);

    expect(result.length).toEqual(3);
  });
});
