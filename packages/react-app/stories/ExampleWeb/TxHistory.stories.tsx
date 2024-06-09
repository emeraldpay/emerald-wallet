import { BlockchainCode, PersistentState, blockchainCodeToId } from '@emeraldwallet/core';
import { txhistory } from '@emeraldwallet/store';
import {Meta} from '@storybook/react';
import * as React from 'react';
import TxHistory from '../../src/transactions/TxHistory';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import { createWallets, setRates, wallet3 } from '../wallets';

const { ChangeType, Direction, State, Status } = PersistentState;

const txEthereum1: PersistentState.Transaction = {
  blockchain: blockchainCodeToId(BlockchainCode.ETH),
  changes: [
    {
      address: '0x2',
      amount: '797181931000000000',
      asset: 'ETH',
      direction: Direction.EARN,
      type: ChangeType.TRANSFER,
      wallet: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
    },
  ],
  txId: 'Withdrawn from Coinbase',
  state: State.PREPARED,
  sinceTimestamp: new Date(Date.now() - 123234),
  status: Status.UNKNOWN,
};

const txEthereum2: PersistentState.Transaction = {
  block: {
    blockId: '0x1',
    height: 99990,
    timestamp: new Date('2023-12-01T11:00:00'),
  },
  blockchain: blockchainCodeToId(BlockchainCode.ETH),
  changes: [
    {
      address: '0x2',
      amount: '15610000000000000',
      asset: 'ETH',
      direction: Direction.SPEND,
      type: ChangeType.TRANSFER,
      wallet: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
    },
  ],
  txId: 'c9351f38...b974e20b',
  state: State.PREPARED,
  sinceTimestamp: new Date('2023-12-01T11:00:00'),
  status: Status.UNKNOWN,
};

const txBitcoin1: PersistentState.Transaction = {
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  changes: [
    {
      address: 'abc',
      amount: '16100000',
      asset: 'BTC',
      direction: Direction.SPEND,
      type: ChangeType.TRANSFER,
      wallet: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
    },
  ],
  txId: 'e3b0c442...ca495991',
  state: State.PREPARED,
  sinceTimestamp: new Date('2024-01-01T11:00:00'),
  status: Status.UNKNOWN,
};

const txBitcoin2: PersistentState.Transaction = {
  blockchain: blockchainCodeToId(BlockchainCode.BTC),
  changes: [
    {
      address: 'abc',
      amount: '1700000',
      asset: 'BTC',
      direction: Direction.EARN,
      type: ChangeType.TRANSFER,
      wallet: 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-1',
    },
  ],
  sinceTimestamp: new Date('2022-01-01T10:00:00'),
  state: State.PREPARED,
  status: Status.UNKNOWN,
  txId: 'from johnny',
};

const api = new MemoryApiMock();
const backend = new BackendMock();

api.txHistory.insertTransactions([txEthereum1, txBitcoin1, txEthereum2, txBitcoin2]);

export default {
  title: 'Example Web / Tx History',
  decorators: [
    providerForStore(api, backend, [
      ...setRates,
      ...createWallets,
      txhistory.actions.loadTransactions(wallet3.id, true),
    ]),
  ],
} as Meta;

export const Transactions = {
  name: 'Tx History',
  render: () => (
    <div style={{ height: '100vh' }}>
      <TxHistory walletId={wallet3.id} />
    </div>
  )
};
