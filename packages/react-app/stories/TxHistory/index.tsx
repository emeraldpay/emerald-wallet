import { BlockchainCode, blockchainCodeToId } from '@emeraldwallet/core';
import { ChangeType, Direction, State, Status } from '@emeraldwallet/core/lib/persisistentState';
import { StoredTransaction } from '@emeraldwallet/store/lib/txhistory/types';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import TxHistory from '../../src/transactions/TxHistory';
import { BackendMock } from '../backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';
import { createWallets, setup, wallet3 } from '../wallets';

const txEthereum1 = new StoredTransaction({
  blockchain: blockchainCodeToId(BlockchainCode.ETH),
  changes: [
    {
      address: '0x1',
      amount: '100000',
      asset: 'ETH',
      direction: Direction.SPEND,
      type: ChangeType.TRANSFER,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
    },
    {
      address: '0x2',
      amount: '100000',
      asset: 'ETH',
      direction: Direction.EARN,
      type: ChangeType.TRANSFER,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
    },
  ],
  txId: '0x1',
  state: State.PREPARED,
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  status: Status.UNKNOWN,
});

const txEthereum2 = new StoredTransaction({
  block: {
    blockId: '0x1',
    height: 99990,
    timestamp: new Date('2022-01-01T11:00:00'),
  },
  blockchain: blockchainCodeToId(BlockchainCode.ETH),
  changes: [
    {
      address: '0x1',
      amount: '100000',
      asset: 'ETH',
      direction: Direction.EARN,
      type: ChangeType.TRANSFER,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
    },
    {
      address: '0x2',
      amount: '100000',
      asset: 'ETH',
      direction: Direction.SPEND,
      type: ChangeType.TRANSFER,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
    },
  ],
  txId: '0x2',
  state: State.PREPARED,
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  status: Status.UNKNOWN,
});

const txBitcoin1 = new StoredTransaction({
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  changes: [
    {
      address: 'abc',
      amount: '100000',
      asset: 'BTC',
      direction: Direction.SPEND,
      type: ChangeType.TRANSFER,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
    },
    {
      address: 'xyz',
      amount: '100000',
      asset: 'BTC',
      direction: Direction.EARN,
      type: ChangeType.TRANSFER,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
    },
  ],
  txId: '0x3',
  state: State.PREPARED,
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  status: Status.UNKNOWN,
});

const txBitcoin2 = new StoredTransaction({
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  changes: [
    {
      address: 'abc',
      amount: '100000',
      asset: 'BTC',
      direction: Direction.EARN,
      type: ChangeType.TRANSFER,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
    },
    {
      address: 'xyz',
      amount: '100000',
      asset: 'BTC',
      direction: Direction.SPEND,
      type: ChangeType.TRANSFER,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
    },
  ],
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  state: State.PREPARED,
  status: Status.UNKNOWN,
  txId: '0x4',
});

const backend = new BackendMock();

storiesOf('TxHistory', module)
  .addDecorator(providerForStore(backend, [...setup, ...createWallets]))
  .addDecorator(withTheme)
  .add('ethereum one', () => <TxHistory entries={wallet3.entries} transactions={[txEthereum1]} />)
  .add('ethereum two', () => <TxHistory entries={wallet3.entries} transactions={[txEthereum2]} />)
  .add('ethereum few', () => <TxHistory entries={wallet3.entries} transactions={[txEthereum1, txEthereum2]} />)
  .add('bitcoin one', () => <TxHistory entries={wallet3.entries} transactions={[txBitcoin1]} />)
  .add('bitcoin two', () => <TxHistory entries={wallet3.entries} transactions={[txBitcoin2]} />)
  .add('bitcoin few', () => <TxHistory entries={wallet3.entries} transactions={[txBitcoin1, txBitcoin2]} />)
  .add('many', () => (
    <TxHistory entries={wallet3.entries} transactions={[txEthereum1, txEthereum2, txBitcoin1, txBitcoin2]} />
  ));
