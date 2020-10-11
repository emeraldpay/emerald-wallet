import {storiesOf} from '@storybook/react';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import TxDetails from '../../src/transactions/TxDetails';
import {BitcoinStoredTransaction, BlockchainCode, EthereumStoredTransaction} from "@emeraldwallet/core";
import {providerForStore} from "../storeProvider";
import withTheme from "../themeProvider";
import {BackendMock} from "../backendMock";
import {txhistory} from '@emeraldwallet/store'
import TxHistory from "../../src/transactions/TxHistory";
import {wallet3, setup, createWallets} from '../wallets';

const txEthereum: EthereumStoredTransaction = {
  blockchain: BlockchainCode.ETH,
  nonce: 1,
  hash: '0x95c1767c33c37ef93de48897c1001679d947bd7f082fdf4e772c534ae180b9c8',
  data: '0xDADA',
  from: '0x1234',
  to: '0x9876',
  gas: 21000,
  gasPrice: new BigNumber('30000000000'),
  value: new BigNumber('100999370000000000000')
};

const txBitcoin: BitcoinStoredTransaction = {
  hash: "82c7a6d20fce9b9682a809028b55ae4061e60fa500cc72c8272f5e685ed7da5d",
  since: new Date(1584624006000),
  blockchain: BlockchainCode.BTC,
  inputs: [
    {
      txid: "55ae4061e60fa500cc72c8272f5e685ed7da5d82c7a6d20fce9b9682a809028b",
      vout: 0,
      amount: 5_123_000,
      entryId: wallet3.entries[1].id
    }
  ],
  outputs: [
    {
      address: "bc1q9sxk9zqjfjjtsfq4hp2xf5y9xca6tmszju9jy6",
      amount: 5_123_000 - 456
    }
  ],
  fee: 456
}

const txBitcoin2: BitcoinStoredTransaction = {
  hash: "28b2c8272f5e685ed7da5d82c7a6d20fce9b9655ae4061e60fa500cc782a8090",
  since: new Date(1581081606000),
  blockchain: BlockchainCode.BTC,
  inputs: [
    {
      txid: "c7a6d20fce9b9682a55ae4065d82809028b1e60fa500cc72c8272f5e685ed7da",
      vout: 0,
      amount: 5_123_000,
      entryId: wallet3.entries[1].id
    },
    {
      txid: "55a272f5e685ed7dae4065d82809028b1e60fa5c7a6d20fce9b9682a00cc72c8",
      vout: 1,
      amount: 2_023_012,
      entryId: wallet3.entries[1].id
    }
  ],
  outputs: [
    {
      address: "bc1q9sxk9zqjfjjtsfq4hp2xf5y9xca6tmszju9jy6",
      amount: 2_000_000
    },
    {
      address: "bc1xca6tk9zqjfjjtsfmszju9jy6q9sxq4hp2xf5y9",
      amount: 5_123_000 + 2_023_012 - 456,
      entryId: wallet3.entries[1].id
    }
  ],
  fee: 456
}

const txBitcoin3: BitcoinStoredTransaction = {
  hash: "4061e60fa500cc78272f5e685ed7da528b2c820fce9b9655aed82c7a6d2a8090",
  since: new Date(1581772806000),
  blockchain: BlockchainCode.BTC,
  inputs: [
    {
      txid: "c7a6d20fce9b9682a55ae4065d82809028b1e60fa500cc72c8272f5e685ed7da",
      vout: 0,
      amount: 5_123_000,
    },
    {
      txid: "55a272f5e685ed7dae4065d82809028b1e60fa5c7a6d20fce9b9682a00cc72c8",
      vout: 1,
      amount: 3_023_012,
    }
  ],
  outputs: [
    {
      address: "bc1q9sxk9zqjfjjtsfq4hp2xf5y9xca6tmszju9jy6",
      amount: 3_000_000,
      entryId: wallet3.entries[1].id
    },
    {
      address: "bc1xca6tk9zqjfjjtsfmszju9jy6q9sxq4hp2xf5y9",
      amount: 5_123_000 + 3_023_012 - 456,
    }
  ],
  fee: 456
}

const backend = new BackendMock();

storiesOf('TxHistory', module)
  .addDecorator(providerForStore(backend, [
    ...setup, ...createWallets,
    txhistory.actions.trackTxs([txEthereum], BlockchainCode.ETH),
    txhistory.actions.trackTxs([txBitcoin, txBitcoin2, txBitcoin3], BlockchainCode.BTC),
  ]))
  .addDecorator(withTheme)
  .add('ethereum single', () => (
    <TxHistory transactions={[txEthereum]} accounts={wallet3.entries}/>
  ))
  .add('bitcoin one', () => (
    <TxHistory transactions={[txBitcoin]} accounts={wallet3.entries}/>
  ))
  .add('bitcoin two', () => (
    <TxHistory transactions={[txBitcoin2]} accounts={wallet3.entries}/>
  ))
  .add('bitcoin few', () => (
    <TxHistory transactions={[txBitcoin, txBitcoin2, txBitcoin3]} accounts={wallet3.entries}/>
  ))
  .add('many', () => (
    <TxHistory transactions={[txBitcoin, txEthereum, txBitcoin2, txBitcoin3]} accounts={wallet3.entries}/>
  ))
;