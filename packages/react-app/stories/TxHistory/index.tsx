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

const txEthereum = new StoredTransaction({
  blockchain: blockchainCodeToId(BlockchainCode.ETH),
  changes: [
    {
      amount: '-100000',
      asset: 'ETH',
      direction: Direction.SPEND,
      type: ChangeType.TRANSFER,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
    },
  ],
  txId: '0x1',
  state: State.PREPARED,
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  status: Status.UNKNOWN,
});

const txBitcoin1 = new StoredTransaction({
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  changes: [
    {
      amount: '-100000',
      asset: 'BTC',
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

const txBitcoin2 = new StoredTransaction({
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  changes: [
    {
      amount: '100000',
      asset: 'BTC',
      direction: Direction.EARN,
      type: ChangeType.TRANSFER,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
    },
  ],
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  state: State.PREPARED,
  status: Status.UNKNOWN,
  txId: '0x3',
});

const txBitcoin3 = new StoredTransaction({
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  changes: [
    {
      amount: '-100000',
      asset: 'BTC',
      direction: Direction.SPEND,
      type: ChangeType.TRANSFER,
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
    },
  ],
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  state: State.PREPARED,
  status: Status.UNKNOWN,
  txId: '0x3',
});

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
