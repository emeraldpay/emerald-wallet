import BigNumber from 'bignumber.js';
import { loadTransactions, storeTransactions } from './historyStorage';
import {BlockchainCode} from "@emeraldwallet/core";

describe('historyStorage', () => {
  it('store and load txs', () => {
    const now = new Date();
    const trans = [{
      timestamp: now,
      hash: '0x1234',
      value: new BigNumber(1),
      chain: BlockchainCode.Unknown,
      chainId: 100,
      gasPrice: '0x0',
      gas: '0x0',
      from: "0x0",
      to: "0x0",
      nonce: 1
    }];

    storeTransactions('key1', trans);
    const loaded = loadTransactions('key1', 100);

    expect(loaded).toHaveLength(1);
    expect(loaded[0].hash).toEqual('0x1234');
    expect(loaded[0].value.comparedTo(new BigNumber(1))).toEqual(0);
    expect(loaded[0].timestamp).toEqual(now.toISOString());
  });
});