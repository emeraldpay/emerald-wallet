import { BlockchainCode, PersistentState, TokenRegistry, blockchainCodeToId } from '@emeraldwallet/core';
import { StoredTransaction } from '@emeraldwallet/store';
import { Meta } from '@storybook/react';
import * as React from 'react';
import TxDetails from '../../src/transactions/TxDetails';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';

const { ChangeType, Direction, State, Status } = PersistentState;

const api = new MemoryApiMock();
const backend = new BackendMock();

const tokenRegistry = new TokenRegistry([]);

const txEthereum = new StoredTransaction(
  tokenRegistry,
  {
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
    sinceTimestamp: new Date('2022-01-01T10:00:00'),
    state: State.PREPARED,
    status: Status.UNKNOWN,
    txId: '0x1',
  },
  null,
);

const txBitcoin1 = new StoredTransaction(
  tokenRegistry,
  {
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
    txId: '0x2',
  },
  null,
);

const txBitcoin2 = new StoredTransaction(
  tokenRegistry,
  {
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
  },
  null,
);

export default {
  title: 'Tx Details',
  decorators: [providerForStore(api, backend)],
} as Meta;

export const Ethereum = () => <TxDetails entryId={'74b0a509-9083-4b12-80bb-e01db1fa2293-1'} tx={txEthereum} />;
export const Bitcoin1 = () => <TxDetails entryId={'74b0a509-9083-4b12-80bb-e01db1fa2293-1'} tx={txBitcoin1} />;
export const Bitcoin2 = () => <TxDetails entryId={'74b0a509-9083-4b12-80bb-e01db1fa2293-1'} tx={txBitcoin2} />;
