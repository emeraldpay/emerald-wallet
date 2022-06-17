import { Satoshi, Wei } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, blockchainCodeToId, PersistentState } from '@emeraldwallet/core';
import { ChangeType, Direction, State, Status } from '@emeraldwallet/core/lib/persisistentState';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import TxDetails from '../../src/transactions/TxDetails';
import withTheme from '../themeProvider';

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

storiesOf('TxDetails', module)
  .addDecorator(withTheme)
  .add('ethereum', () => <TxDetails tx={txEthereum} />)
  .add('bitcoin 1', () => <TxDetails tx={txBitcoin1} />)
  .add('bitcoin 2', () => <TxDetails tx={txBitcoin2} />);
