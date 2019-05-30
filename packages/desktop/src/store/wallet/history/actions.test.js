import { fromJS } from 'immutable';
import { refreshTrackedTransactions } from './actions';
import { ipcRenderer } from '../../../__mocks__/electron-mock';


describe('historyActions/refreshTrackedTransactions', () => {
  const getState = () => ({
    network: fromJS({
      currentBlock: {
        height: 100,
      },
    }),
    wallet: {
      settings: fromJS({
        numConfirmations: 10,
      }),
      history: fromJS({
        chainId: 'morden',
        trackedTransactions: [{numConfirmations: 0, hash: '0x123'}],
      }),
    },
  });

  it('should subscribe through electron', () => {
    const dispatch = jest.fn();
    const hash = '0x123';

    refreshTrackedTransactions(hash)(dispatch, getState);

    expect(ipcRenderer.send).toHaveBeenCalledWith('subscribe-tx', '0x123');
  });
});
