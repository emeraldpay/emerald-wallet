import { BlockchainCode, PersistentState, blockchainCodeToId } from '@emeraldwallet/core';
import { StoredTransaction } from '@emeraldwallet/store/lib/txhistory/types';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import TxDetails from '../../src/transactions/TxDetails';
import { BackendMock } from '../backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';

const { ChangeType, Direction, State, Status } = PersistentState;

const backend = new BackendMock();

const txEthereum = new StoredTransaction(
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

storiesOf('TxDetails', module)
  .addDecorator(providerForStore(backend))
  .addDecorator(withTheme)
  .add('ethereum', () => <TxDetails tx={txEthereum} />)
  .add('bitcoin 1', () => <TxDetails tx={txBitcoin1} />)
  .add('bitcoin 2', () => <TxDetails tx={txBitcoin2} />);
