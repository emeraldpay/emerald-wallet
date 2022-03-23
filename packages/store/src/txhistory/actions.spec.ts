import { ipcRenderer } from 'electron';
import { fromJS } from 'immutable';
import rootReducer from '../root-reducer';
import { IState } from '../types';
import { refreshTrackedTransactions } from './actions';

describe('historyActions/refreshTrackedTransactions', () => {
  let state = rootReducer(undefined, { type: '' });
  state = {
    ...state,
    blockchains: {
      eth: {
        height: 100
      }
    },
    settings: fromJS({
    }),
    history: fromJS({
      trackedTransactions: [{hash: '0x123', blockchain: 'ETH'}]
    })
  };
  const getState = (): IState => (state);

  it('should subscribe through electron', () => {
    const dispatch = jest.fn();
    const hash = '0x123';
    const extra: any = {};
    refreshTrackedTransactions()(dispatch, getState, extra);

    expect(ipcRenderer.send).toHaveBeenCalledWith('subscribe-tx', 'ETH', '0x123');
  });
});
