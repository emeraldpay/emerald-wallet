import { EthRpc } from '@emeraldplatform/eth-rpc';
import { DefaultJsonRpc } from '@emeraldplatform/rpc';
import { fromJS } from 'immutable';
import { loadSyncing } from './networkActions';
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
      request: () => Promise.resolve([{
        id: 1,
        result: false,
      }]),
    };

    const ethRpc = new EthRpc(new DefaultJsonRpc(fakeTransport));
    const dispatch = jest.fn();

    return loadSyncing()(dispatch, getState, { geth: ethRpc }).then(() => {
      expect(dispatch).toBeCalledWith({
        type: ActionTypes.SYNCING,
        syncing: false,
      });
    });
  });
});
