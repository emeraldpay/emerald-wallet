import {storiesOf} from '@storybook/react';
import * as React from 'react';
import withTheme from "../themeProvider";
import {BackendMock} from "../backendMock";
import {providerForStore} from "../storeProvider";
import {setup, setBalances, createWallets} from '../wallets';
import ReceiveScreen from "../../src/receive/ReceiveScreen";

const backend = new BackendMock();

storiesOf('Receive', module)
  .addDecorator(providerForStore(backend, [...setup, ...createWallets, ...setBalances]))
  .addDecorator(withTheme)
  .add('wallet 1', () => (
    <ReceiveScreen walletId={'8ff89b7d-8a73-4ee0-ad5b-8ac1f04a49ef'}/>
  ))
  .add('wallet 2', () => (
    <ReceiveScreen walletId={'1022fd13-3431-4f3b-bce8-109fdab15873'}/>
  ))
;