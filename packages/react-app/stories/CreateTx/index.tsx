import { Satoshi, WEIS } from '@emeraldpay/bigamount-crypto';
import { Wei } from '@emeraldpay/bigamount-crypto/lib/ethereum';
import { BitcoinEntry } from '@emeraldpay/emerald-vault-core/lib/types';
import { BlockchainCode, EthereumTransactionType, workflow } from '@emeraldwallet/core';
import { CreateBitcoinTx } from '@emeraldwallet/core/lib/workflow';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Confirm from '../../src/transaction/CreateBitcoinTransaction/Confirm';
import CreateBitcoinTransaction from '../../src/transaction/CreateBitcoinTransaction/CreateBitcoinTransaction';
import Sign from '../../src/transaction/CreateBitcoinTransaction/Sign';
import CreateTx from '../../src/transaction/CreateTx';
import AmountField from '../../src/transaction/CreateTx/AmountField';
import FromField from '../../src/transaction/CreateTx/FromField';
import ToField from '../../src/transaction/CreateTx/ToField';
import { BackendMock, REAL_BTC_TX } from '../backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';
import { createWallets, setBalances, setup, wallet3 } from '../wallets';

const backend = new BackendMock();
backend.useBlockchains(['BTC', 'ETC']);
backend.vault.setSeedPassword('b00e3378-40e7-4eca-b287-a5ead2f747d4', 'test');

const ethereumTx = new workflow.CreateEthereumTx({
  amount: new Wei('1.23', 'ETHER'),
  blockchain: BlockchainCode.Goerli,
  gas: 100,
  gasPrice: new Wei('20', 'GWEI'),
  target: workflow.TxTarget.MANUAL,
  type: EthereumTransactionType.EIP1559,
});

storiesOf('CreateTx Ethereum', module)
  .addDecorator(providerForStore(backend, [...setup]))
  .addDecorator(withTheme)
  .add('Create ETC', () => (
    <CreateTx
      chain={BlockchainCode.Goerli}
      eip1559={false}
      highGasPrice={{ max: 0, priority: 0 }}
      lowGasPrice={{ max: 0, priority: 0 }}
      stdGasPrice={{ max: 0, priority: 0 }}
      tokenSymbols={['ETC']}
      token={'ETC'}
      tx={ethereumTx}
      txFeeToken="ETH"
      getBalance={() => new Wei(0)}
      getTokenBalanceForAddress={() => new Wei(0)}
      onChangeAmount={action('onChangeAmount')}
      onChangeTo={action('onChangeTo')}
    />
  ))
  .add('Create EIP-1559', () => (
    <CreateTx
      chain={BlockchainCode.Goerli}
      eip1559={true}
      highGasPrice={{ max: '30000000000', priority: '3000000000' }}
      lowGasPrice={{ max: '10000000000', priority: '1000000000' }}
      stdGasPrice={{ max: '20000000000', priority: '2000000000' }}
      tokenSymbols={['ETC']}
      token={'ETC'}
      tx={ethereumTx}
      txFeeToken="ETH"
      getBalance={() => new Wei(0)}
      getTokenBalanceForAddress={() => new Wei(0)}
      onChangeAmount={action('onChangeAmount')}
      onChangeTo={action('onChangeTo')}
    />
  ))
  .add('AmountField', () => <AmountField units={WEIS} onChangeAmount={action('onChangeAmount')} />)
  .add('AmountField (101.202)', () => (
    <AmountField units={WEIS} amount={new Wei('101.202', 'ETHER')} onChangeAmount={action('onChangeAmount')} />
  ))
  .add('FromField', () => <FromField accounts={['0x1', '02']} />)
  .add('ToField', () => <ToField blockchain={BlockchainCode.Goerli} onChange={action('onChangeToField')} />);

const bitcoinTx = new CreateBitcoinTx(
  wallet3.entries[1] as BitcoinEntry,
  [
    {
      address: 'bc1qvnvpqr9d6k4cvz9yy842zr73kcmqcshl8gvgn6',
      hdPath: "m/84'/0'/3'/0/3",
      role: 'change',
    },
    {
      address: 'bc1qa2s34p38jyuen859slf28nnvccauk6xuwqzug4',
      hdPath: "m/84'/0'/3'/0/2",
      role: 'receive',
    },
  ],
  [
    {
      txid: '75be7ffb8726bc193f20c2225cdac3b014de9bbc92f1d3c45e2595ad147d0fc2',
      vout: 0,
      value: Satoshi.fromBitcoin(1.5).encode(),
      address: 'bc1qmpwznj3e8v7mz2swwppu9stjrac2q9zy9x983h',
    },
    {
      txid: '14de9bbc925ad147d0fc2f1d3c45e75be7ffb8726bc193f20c2225cdac3b0259',
      vout: 0,
      value: Satoshi.fromBitcoin(2).encode(),
      address: 'bc1q8xw7slwt90dtx4nrs08pjsq244eusxn605v9w9',
    },
  ],
);
bitcoinTx.requiredAmount = Satoshi.fromBitcoin(1.2);
bitcoinTx.address = 'bc1q5c4g4njf4g7a2ugu0tq5rjjdg3j0yexus7x3f4';

storiesOf('CreateTx Bitcoin', module)
  .addDecorator(providerForStore(backend, [...setup, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('Create Bitcoin', () => <CreateBitcoinTransaction source={'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3'} />)
  .add('Simple Summary', () => (
    <Sign
      blockchain={BlockchainCode.BTC}
      entryId={'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3'}
      tx={bitcoinTx.create()}
      onSign={action('sign')}
      seedId={'b00e3378-40e7-4eca-b287-a5ead2f747d4'}
    />
  ))
  .add('Confirm', () => (
    <Confirm
      onConfirm={action('confirm')}
      blockchain={BlockchainCode.BTC}
      entryId={'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3'}
      rawTx={REAL_BTC_TX}
    />
  ));
