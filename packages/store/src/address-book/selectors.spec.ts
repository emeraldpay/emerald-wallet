import { BlockchainCode } from '@emeraldwallet/core';
import * as selectors from './selectors';
import { moduleName } from './types';

describe('all', () => {
  const state = {
    [moduleName]: {
      loading: false,
      contacts: {
        [BlockchainCode.ETC] : {
          '0x123': {
            address: '0x123',
            name: 'name1',
            blockchain: BlockchainCode.ETC
          }
        },
        [BlockchainCode.ETH]: {
          '0x222': {
            address: '0x222',
            name: 'name2'
          },
          '0x333': {
            address: '0x333',
            name: 'name3'
          }
        }
      }
    }
  };

  it('should return array of contacts', () => {
    const result = selectors.all(state);
    expect(result.length).toEqual(3);
  });
});
