import { Meta } from '@storybook/react';
import { accounts } from '@emeraldwallet/store';
import * as React from 'react';
import AddHDAddress from '../../src/create-account/AddHDAddress';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import { createSeeds, wallet4, wallet5 } from '../wallets';

const api = new MemoryApiMock();
const backend = new BackendMock();

api.vault.setSeedPassword('b00e3378-40e7-4eca-b287-a5ead2f747d4', 'password');

export default {
  title: 'Ledger Additional Address',
  decorators: [providerForStore(api, backend, [...createSeeds, accounts.actions.setWalletsAction([wallet4, wallet5])])],
} as Meta;

export const Default = () => <AddHDAddress walletId="5c455045-2259-43b3-8e81-5ec9d2be36d6" />;
export const Ledger = () => <AddHDAddress walletId="796657ee-99de-4879-87d9-17b2d8c30551" />;
