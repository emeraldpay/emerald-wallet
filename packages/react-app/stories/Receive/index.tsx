import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ReceiveScreen from '../../src/receive/ReceiveScreen';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';
import { createWallets, setBalances, setRates } from '../wallets';

const api = new MemoryApiMock();
const backend = new BackendMock();

storiesOf('Receive', module)
  .addDecorator(providerForStore(api, backend, [...setRates, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('wallet 1', () => <ReceiveScreen walletId={'8ff89b7d-8a73-4ee0-ad5b-8ac1f04a49ef'} />)
  .add('wallet 2', () => <ReceiveScreen walletId={'1022fd13-3431-4f3b-bce8-109fdab15873'} />)
  .add('wallet 3', () => <ReceiveScreen walletId={'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4'} />);
