import {storiesOf} from '@storybook/react';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import TxDetails from '../../src/transactions/TxDetails';
import {BitcoinStoredTransaction, BlockchainCode, EthereumStoredTransaction} from "@emeraldwallet/core";
import {providerForStore} from "../storeProvider";
import withTheme from "../themeProvider";
import {BackendMock} from "../backendMock";
import {txhistory} from '@emeraldwallet/store'

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
  since: new Date(1581081606000),
  blockchain: BlockchainCode.BTC,
  inputs: [
    {
      txid: "55ae4061e60fa500cc72c8272f5e685ed7da5d82c7a6d20fce9b9682a809028b",
      vout: 0,
      amount: 5_123_000
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
      amount: 5_123_000
    },
    {
      txid: "55a272f5e685ed7dae4065d82809028b1e60fa5c7a6d20fce9b9682a00cc72c8",
      vout: 1,
      amount: 2_023_012
    }
  ],
  outputs: [
    {
      address: "bc1q9sxk9zqjfjjtsfq4hp2xf5y9xca6tmszju9jy6",
      amount: 2_000_000
    },
    {
      address: "bc1xca6tk9zqjfjjtsfmszju9jy6q9sxq4hp2xf5y9",
      amount: 5_123_000 + 2_023_012 - 456
    }
  ],
  fee: 456
}

const backend = new BackendMock();

storiesOf('TxDetails', module)
  .addDecorator(providerForStore(backend, [
    txhistory.actions.trackTxs([txEthereum], BlockchainCode.ETH),
    txhistory.actions.trackTxs([txBitcoin, txBitcoin2], BlockchainCode.BTC),
  ]))
  .addDecorator(withTheme)
  .add('ethereum', () => (
    <TxDetails hash={txEthereum.hash}/>
  ))
  .add('bitcoin', () => (
    <TxDetails hash={txBitcoin.hash}/>
  ))
  .add('bitcoin 2', () => (
    <TxDetails hash={txBitcoin2.hash}/>
  ))
;
