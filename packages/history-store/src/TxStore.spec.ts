import { BlockchainCode } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import TxStore from './TxStore';

const rimraf = require('rimraf');

describe('TxStore', () => {
  it('should create dir structure wallet0/ethereum-transactions.json', () => {
    const store = new TxStore('wallet0', BlockchainCode.ETH);
    store.save([]);
    expect(store.getFilePath()).toContain('wallet0');
    expect(store.getFilePath()).toContain(BlockchainCode.ETH);
    rimraf(store.getFilePath(), jest.fn());
  });

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
      from: '0x0',
      to: '0x0',
      nonce: 1,
      blockchain: BlockchainCode.Morden,
      since: new Date(),
      discarded: false
    }];

    const store = new TxStore('wallet0', BlockchainCode.ETC);
    store.save(trans);
    const loaded = store.load();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].hash).toEqual('0x1234');
    expect((loaded[0].value as BigNumber).comparedTo(new BigNumber(1))).toEqual(0);
    expect(loaded[0].timestamp).toEqual(now);

    rimraf(store.getFilePath(), jest.fn());
  });
});
