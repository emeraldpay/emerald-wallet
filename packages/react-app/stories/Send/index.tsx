import { storiesOf } from '@storybook/react';
import * as React from 'react';
import SelectAccount from '../../src/transaction/CreateTransaction/SelectAccount';
import { BackendMock } from '../backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';
import { createWallets, initLauncher, setBalances, setRates } from '../wallets';

const backend = new BackendMock();

storiesOf('Send', module)
  .addDecorator(providerForStore(backend, [...initLauncher, ...setRates, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('select account / wallet 1', () => <SelectAccount walletId={'8ff89b7d-8a73-4ee0-ad5b-8ac1f04a49ef'} />)
  .add('select account / wallet 2', () => <SelectAccount walletId={'1022fd13-3431-4f3b-bce8-109fdab15873'} />)
  .add('select account / wallet 3', () => <SelectAccount walletId={'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4'} />);
