import BigNumber from 'bignumber.js';
import { loadTransactions, storeTransactions } from './historyStorage';

describe('historyStorage', () => {
  it('store and load txs', () => {
    const trans = [{
      hash: '0x1234',
      value: new BigNumber(1),
    }];

    storeTransactions('key1', trans);
    const loaded = loadTransactions('key1');

    expect(loaded).toHaveLength(1);
    expect(loaded[0].hash).toEqual('0x1234');
    expect(loaded[0].value).toEqual(new BigNumber(1));
  });
});
