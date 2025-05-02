import { HistoryState, RemoveStoredTxAction, ActionTypes } from './types';
import { reducer } from './reducer';

describe('tx history', () => {

  describe("remove stored", () => {
    it ("remove nothing", () => {
      let prev: Partial<HistoryState> = {
        transactions: [
          // @ts-ignore
          {txId: "test1"}
        ]
      };
      let action: RemoveStoredTxAction = {
        type: ActionTypes.REMOVE_STORED_TX,
        txIds: []
      }

      let next = reducer(prev as HistoryState, action);

      expect(next.transactions.length).toEqual(1);
    })

    it ("remove existing", () => {
      let prev: Partial<HistoryState> = {
        transactions: [
          // @ts-ignore
          {txId: "test1"},
          // @ts-ignore
          {txId: "test2"},
          // @ts-ignore
          {txId: "test3"}
        ]
      };
      let action: RemoveStoredTxAction = {
        type: ActionTypes.REMOVE_STORED_TX,
        txIds: ["test2"]
      }

      let next = reducer(prev as HistoryState, action);

      expect(next.transactions.map((t) => t.txId)).toEqual(["test1", "test3"]);
    })

  });

})
