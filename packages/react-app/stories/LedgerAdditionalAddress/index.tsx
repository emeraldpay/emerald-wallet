import { accounts, hwkey } from '@emeraldwallet/store';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import AddHDAddress from '../../src/create-account/AddHDAddress';
import { BackendMock } from '../backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';
import { createSeeds, wallet4, wallet5 } from '../wallets';

const backend = new BackendMock();

backend.vault.setSeedPassword('b00e3378-40e7-4eca-b287-a5ead2f747d4', 'password');

storiesOf('LedgerAdditionalAddress', module)
  .addDecorator(providerForStore(backend, [...createSeeds, accounts.actions.setWalletsAction([wallet4, wallet5])]))
  .addDecorator(withTheme)
  .add('default', () => <AddHDAddress walletId="5c455045-2259-43b3-8e81-5ec9d2be36d6" />)
  .add('ledger', () => <AddHDAddress walletId="796657ee-99de-4879-87d9-17b2d8c30551" />);
