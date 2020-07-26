import {storiesOf} from '@storybook/react';
import * as React from 'react';
import {WalletReference} from "../../src";
import {Units, Wallet} from '@emeraldwallet/core';
import {IBalanceValue} from "@emeraldwallet/store";
import {Units as WeiUnits, Wei} from "@emeraldplatform/eth";

const wallet1: Wallet = {
  accounts: [],
  id: "a7ca68a2-74f9-4c5e-be75-92ce3b8ceb05",
  name: "My Wallet"
}

const wallet2: Wallet = {
  accounts: [],
  id: "3acca0fa-8581-43b5-9296-bd3a1be6b663",
}

const balance1: IBalanceValue = {
  balance: Wei.ZERO,
  token: "ETH"
}

const balance2: IBalanceValue = {
  balance: new Wei(10.25, WeiUnits.ETHER),
  token: "ETH"
}

const balance3: IBalanceValue = {
  balance: new Units(1045, 18),
  token: "DAI"
}

storiesOf('Wallet', module)
  .add('empty wallet', () =>
    <WalletReference wallet={wallet1} assets={[balance1]}/>
  )
  .add('wallet with one currency', () =>
    <WalletReference wallet={wallet1} assets={[balance2]}/>
  )
  .add('wallet with two currencies', () =>
    <WalletReference wallet={wallet1} assets={[balance2, balance3]}/>
  )
  .add('unnamed wallet', () =>
    <WalletReference wallet={wallet2} assets={[balance1, balance3]}/>
  )
;
