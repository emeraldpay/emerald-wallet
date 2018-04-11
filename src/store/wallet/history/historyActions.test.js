import { fromJS } from 'immutable';
import { processPending } from './historyActions';
import { loadTransactions } from './historyStorage';


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
