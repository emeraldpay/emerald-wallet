import {BlockchainCode, workflow} from '@emeraldwallet/core';
import {storiesOf} from '@storybook/react';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import CreateTx from '../../src/transaction/CreateTx';
import AmountField from '../../src/transaction/CreateTx/AmountField';
import FromField from '../../src/transaction/CreateTx/FromField';
import ToField from '../../src/transaction/CreateTx/ToField';
import {Wei} from "@emeraldpay/bigamount-crypto/lib/ethereum";
import CreateBitcoinTransaction from "../../src/transaction/CreateBitcoinTransaction/CreateBitcoinTransaction";
import {providerForStore} from "../storeProvider";
import {createWallets, setup, setBalances, wallet3} from "../wallets";
import withTheme from "../themeProvider";
import {BackendMock, REAL_BTC_TX} from '../backendMock';
import Sign from "../../src/transaction/CreateBitcoinTransaction/Sign";
import {CreateBitcoinTx} from "@emeraldwallet/core/lib/workflow";
import {BitcoinEntry} from "@emeraldpay/emerald-vault-core/lib/types";
import {Satoshi} from "@emeraldpay/bigamount-crypto";
import {action} from "@storybook/addon-actions";
import RawTx from "../../src/transaction/CreateBitcoinTransaction/RawTx";
import Confirm from "../../src/transaction/CreateBitcoinTransaction/Confirm";

const backend = new BackendMock();
backend.useBlockchains(["BTC", "ETC"]);
backend.vault.setSeedPassword("b00e3378-40e7-4eca-b287-a5ead2f747d4", "test");

const txDetails = {
  token: 'ETC',
  gasLimit: '200',
  amount: new Wei('10000000'),
  gas: new BigNumber('100'),
  gasPrice: new Wei('10000'),
  target: workflow.TxTarget.MANUAL
};

storiesOf('CreateTx Ethereum', module)
  .add('Create ETC', () => (
    <CreateTx
      tokenSymbols={['ETC']}
      token={'ETC'}
      tx={new workflow.CreateEthereumTx(txDetails)}
      txFeeToken='ETH'
    />
  ))
  .add('AmountField', () => (<AmountField amount={new Wei('10000000')}/>))
  .add('FromField', () => (<FromField accounts={['0x1', '02']}/>))
  .add('ToField', () => (<ToField/>));

const create1 = new CreateBitcoinTx(
  wallet3.entries[1] as BitcoinEntry,
  [
    {
      txid: "75be7ffb8726bc193f20c2225cdac3b014de9bbc92f1d3c45e2595ad147d0fc2",
      vout: 0,
      value: Satoshi.fromBitcoin(1.5).encode(),
      address: "bc1qmpwznj3e8v7mz2swwppu9stjrac2q9zy9x983h",
    },
    {
      txid: "14de9bbc925ad147d0fc2f1d3c45e75be7ffb8726bc193f20c2225cdac3b0259",
      vout: 0,
      value: Satoshi.fromBitcoin(2).encode(),
      address: "bc1q8xw7slwt90dtx4nrs08pjsq244eusxn605v9w9"
    },
  ]
);
create1.requiredAmountBitcoin = 1.2;
create1.address = "bc1q5c4g4njf4g7a2ugu0tq5rjjdg3j0yexus7x3f4";

storiesOf('CreateTx Bitcoin', module)
  .addDecorator(providerForStore(backend, [...setup, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('Create Bitcoin', () => (
    <CreateBitcoinTransaction
      source={"f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3"}
    />
  ))
  .add('Simple Summary', () => (
    <Sign blockchain={BlockchainCode.BTC}
          entryId={"f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3"}
          tx={create1.create()}
          onSign={action("sign")}
          seedId={"b00e3378-40e7-4eca-b287-a5ead2f747d4"}/>
  ))
  .add('Confirm', () => (
    <Confirm
      onConfirm={action("confirm")}
      blockchain={BlockchainCode.BTC}
      entryId={"f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3"}
      rawtx={REAL_BTC_TX}/>
  ))

