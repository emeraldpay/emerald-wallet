import { EthRpc } from '@emeraldplatform/eth-rpc';
import { JsonRpc } from '@emeraldplatform/rpc';
import { fromJS } from 'immutable';
import { loadSyncing, loadHeight } from './networkActions';
import ActionTypes from './actionTypes';

describe('networkActions/loadSyncing', () => {
  const getState = () => ({
    launcher: fromJS({
      geth: {
        type: 'remote',
      },
    }),
  });

  it('should call sync rpc endpoint', () => {
    const fakeTransport = {
      request: () => Promise.resolve({
        result: false,
      }),
    };

    const ethRpc = new EthRpc(new JsonRpc(fakeTransport));
    const dispatch = jest.fn();

    return loadSyncing()(dispatch, getState, { geth: ethRpc }).then(() => {
      expect(dispatch).toBeCalledWith({
        type: ActionTypes.SYNCING,
        syncing: false,
      });
    });
  });
});


describe('networkActions/loadHeight', () => {
  const getState = () => ({
  });
  it('should call getBlockNumber rpc endpoint', () => {
    const fakeTransport = {
      request: () => Promise.resolve({
        result: 0xc,
      }),
    };
    const ethRpc = new EthRpc(new JsonRpc(fakeTransport));
    const dispatch = jest.fn();
    return loadHeight(false)(dispatch, getState, { geth: ethRpc }).then(() => {
      expect(dispatch).toBeCalledWith({
        type: ActionTypes.BLOCK,
        height: 12,
      });
    });
  });
});
