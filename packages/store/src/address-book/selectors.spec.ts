import {BlockchainCode} from '@emeraldwallet/core';
import * as selectors from './selectors';
import {moduleName} from './types';
import {IState} from "../types";

describe('all', () => {
  const state: Partial<IState> = {
    [moduleName]: {
      loading: false,
      contacts: {
        [BlockchainCode.ETC]: {
          '0x123': {
            address: {type: 'single', value: '0x123'},
            name: 'name1',
            blockchain: 101,
            createdAt: new Date()
          }
        },
        [BlockchainCode.ETH]: {
          '0x222': {
            address: {type: 'single', value: '0x222'},
            name: 'name2',
            blockchain: 100,
            createdAt: new Date()
          },
          '0x333': {
            address: {type: 'single', value: '0x333'},
            name: 'name3',
            blockchain: 100,
            createdAt: new Date()
          }
        }
      }
    }
  };

  it('should return array of contacts', () => {
    const result = selectors.all(state as IState);
    expect(result.length).toEqual(3);
  });
});
