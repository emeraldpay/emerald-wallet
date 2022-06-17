import { Satoshi, Wei } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, blockchainCodeToId, PersistentState } from '@emeraldwallet/core';
import { ChangeType, Direction, State, Status } from '@emeraldwallet/core/lib/persisistentState';
import { mount } from 'enzyme';
import * as React from 'react';
import { default as TxDetails } from './TxDetails';

const ethereumTx: PersistentState.Transaction = {
  blockchain: blockchainCodeToId(BlockchainCode.ETH),
  txId: '0x95c1767c33c37ef93de48897c1001679d947bd7f082fdf4e772c534ae180b9c8',
  state: State.PREPARED,
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  status: Status.UNKNOWN,
  changes: [
    {
      type: ChangeType.TRANSFER,
      amount: '-100000',
      amountValue: new Wei('-100000'),
      direction: Direction.SPEND,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
      asset: 'ETH',
    },
  ],
};

const bitcoinTx: PersistentState.Transaction = {
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  txId: '01679d947bd7f082fdf4e772c534ae1895c1767c33c37ef93de48897c100b9c8',
  state: State.PREPARED,
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  status: Status.UNKNOWN,
  changes: [
    {
      type: ChangeType.TRANSFER,
      amount: '-100000',
      amountValue: new Satoshi('-100000'),
      direction: Direction.SPEND,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
      asset: 'BTC',
    },
  ],
};

describe('TxDetailsView', () => {
  it('should render ethereum tx', () => {
    expect(mount(<TxDetails tx={ethereumTx} />)).toBeDefined();
  });

  it('should render bitcoin tx', () => {
    expect(mount(<TxDetails tx={bitcoinTx} />)).toBeDefined();
  });
});
