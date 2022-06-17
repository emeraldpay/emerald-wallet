import { Satoshi, Wei } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, blockchainCodeToId, PersistentState } from '@emeraldwallet/core';
import { ChangeType, Direction, State, Status } from '@emeraldwallet/core/lib/persisistentState';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import TxHistory from '../../src/transactions/TxHistory';
import { BackendMock } from '../backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';
import { createWallets, setup, wallet3 } from '../wallets';

const txEthereum: PersistentState.Transaction = {
  blockchain: blockchainCodeToId(BlockchainCode.ETH),
  txId: '0x1',
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

const txBitcoin1: PersistentState.Transaction = {
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  txId: '0x2',
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

const txBitcoin2: PersistentState.Transaction = {
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  txId: '0x3',
  state: State.PREPARED,
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  status: Status.UNKNOWN,
  changes: [
    {
      type: ChangeType.TRANSFER,
      amount: '100000',
      amountValue: new Satoshi('100000'),
      direction: Direction.EARN,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
      asset: 'BTC',
    },
  ],
};

const txBitcoin3: PersistentState.Transaction = {
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  txId: '0x3',
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

const backend = new BackendMock();

storiesOf('TxHistory', module)
  .addDecorator(providerForStore(backend, [...setup, ...createWallets]))
  .addDecorator(withTheme)
  .add('ethereum single', () => <TxHistory entries={wallet3.entries} transactions={[txEthereum]} />)
  .add('bitcoin one', () => <TxHistory entries={wallet3.entries} transactions={[txBitcoin1]} />)
  .add('bitcoin two', () => <TxHistory entries={wallet3.entries} transactions={[txBitcoin2]} />)
  .add('bitcoin few', () => <TxHistory entries={wallet3.entries} transactions={[txBitcoin1, txBitcoin2, txBitcoin3]} />)
  .add('many', () => (
    <TxHistory entries={wallet3.entries} transactions={[txBitcoin1, txEthereum, txBitcoin2, txBitcoin3]} />
  ));
