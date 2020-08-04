import {storiesOf} from '@storybook/react';
import * as React from 'react';
import withTheme from "../themeProvider";
import {BackendMock} from "../backendMock";
import {providerForStore} from "../storeProvider";
import {setup, setBalances, createWallets} from '../wallets';
import SelectAccount from "../../src/transaction/CreateTransaction/SelectAccount";

const backend = new BackendMock();

storiesOf('Send', module)
  .addDecorator(providerForStore(backend, [...setup, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('select account / wallet 1', () => (
    <SelectAccount walletId={'8ff89b7d-8a73-4ee0-ad5b-8ac1f04a49ef'}/>
  ))
  .add('select account / wallet 2', () => (
    <SelectAccount walletId={'1022fd13-3431-4f3b-bce8-109fdab15873'}/>
  ))
;