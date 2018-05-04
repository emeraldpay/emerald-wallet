import { fromJS } from 'immutable';
import { EthRpc, JsonRpc } from 'emerald-js';
import { processPending, refreshTransaction } from './historyActions';
import { loadTransactions } from './historyStorage';
import ActionTypes from './actionTypes';


describe('historyActions/refreshTransaction', () => {
  const getState = () => ({
    wallet: {
      history: fromJS({
        chainId: 'morden',
        trackedTransactions: [],
      }),
    },
  });

  it('should call eth.getTransaction rpc endpoint', () => {
    const fakeTransport = {
      request: () => Promise.resolve({
        result: null,
      }),
    };

    const ethRpc = new EthRpc(new JsonRpc(fakeTransport));
    const dispatch = jest.fn();

    const hash = '0x123';
    return refreshTransaction(hash)(dispatch, getState, { geth: ethRpc }).then(() => {
      expect(dispatch).toBeCalledWith({
        type: ActionTypes.TRACKED_TX_NOTFOUND,
        hash,
      });
    });
  });
});

describe('historyActions/processPending', () => {
  it('should persist txs', () => {
    const getState = () => {
      return {
        wallet: {
          history: fromJS({
            trackedTransactions: [{hash: '0x123'}],
            chainId: 1,
          }),
        },
      };
    };
    const dispatch = jest.fn();

    const before = loadTransactions('chain-1-trackedTransactions');
    expect(before).toHaveLength(0);

    // do
    processPending([{}])(dispatch, getState);

    // assert
    const after = loadTransactions('chain-1-trackedTransactions');
    expect(after).toHaveLength(1);
  });
});
