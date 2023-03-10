import { BlockchainCode, PersistentState, blockchainCodeToId } from '@emeraldwallet/core';
import { txhistory } from '@emeraldwallet/store';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import TxHistory from '../../src/transactions/TxHistory';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';
import { createWallets, setRates, wallet3 } from '../wallets';

const { ChangeType, Direction, State, Status } = PersistentState;

const txEthereum1: PersistentState.Transaction = {
  blockchain: blockchainCodeToId(BlockchainCode.ETH),
  changes: [
    {
      address: '0x1',
      amount: '100000',
      asset: 'ETH',
      direction: Direction.SPEND,
      type: ChangeType.TRANSFER,
      wallet: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
    },
    {
      address: '0x2',
      amount: '100000',
      asset: 'ETH',
      direction: Direction.EARN,
      type: ChangeType.TRANSFER,
      wallet: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
    },
  ],
  txId: '0x1',
  state: State.PREPARED,
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  status: Status.UNKNOWN,
};

const txEthereum2: PersistentState.Transaction = {
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
      wallet: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
    },
    {
      address: '0x2',
      amount: '100000',
      asset: 'ETH',
      direction: Direction.SPEND,
      type: ChangeType.TRANSFER,
      wallet: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
    },
  ],
  txId: '0x2',
  state: State.PREPARED,
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  status: Status.UNKNOWN,
};

const txBitcoin1: PersistentState.Transaction = {
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  changes: [
    {
      address: 'abc',
      amount: '100000',
      asset: 'BTC',
      direction: Direction.SPEND,
      type: ChangeType.TRANSFER,
      wallet: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
    },
    {
      address: 'xyz',
      amount: '100000',
      asset: 'BTC',
      direction: Direction.EARN,
      type: ChangeType.TRANSFER,
      wallet: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
    },
  ],
  txId: '0x3',
  state: State.PREPARED,
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  status: Status.UNKNOWN,
};

const txBitcoin2: PersistentState.Transaction = {
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  changes: [
    {
      address: 'abc',
      amount: '100000',
      asset: 'BTC',
      direction: Direction.EARN,
      type: ChangeType.TRANSFER,
      wallet: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
    },
    {
      address: 'xyz',
      amount: '100000',
      asset: 'BTC',
      direction: Direction.SPEND,
      type: ChangeType.TRANSFER,
      wallet: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
    },
  ],
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  state: State.PREPARED,
  status: Status.UNKNOWN,
  txId: '0x4',
};

const api = new MemoryApiMock();
const backend = new BackendMock();

api.txHistory.insertTransactions([txEthereum1, txBitcoin1, txEthereum2, txBitcoin2]);

storiesOf('TxHistory', module)
  .addDecorator(withTheme)
  .addDecorator(
    providerForStore(api, backend, [
      ...setRates,
      ...createWallets,
      txhistory.actions.loadTransactions(wallet3.id, true),
    ]),
  )
  .add('transactions', () => (
    <div style={{ height: '100vh' }}>
      <TxHistory walletId={wallet3.id} />
    </div>
  ));
