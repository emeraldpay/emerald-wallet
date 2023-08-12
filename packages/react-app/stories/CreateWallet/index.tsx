import { SeedDefinition, SeedDescription } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, Blockchains, IBlockchain } from '@emeraldwallet/core';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import UnlockSeed from '../../src/create-account/UnlockSeed';
import CreateWalletWizard from '../../src/create-wallet/CreateWalletWizard';
import { Result } from '../../src/create-wallet/flow/types';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';

const handlers = {
  onCreate: (value: Result) => {
    action('Wallet Create')(value);
    return Promise.resolve('6aacf568-ec33-435f-b234-3668534a7f13');
  },
  onError: action('Error'),
  onCancel: action('Cancel'),
  mnemonicGenerator: () => {
    return Promise.resolve(
      'accuse spin gym afraid reunion poverty mango north silk lottery tank bulk' +
        ' hawk sting movie secret copper goose below use pig vintage resource plate',
    );
  },
  onSaveSeed: (seed: SeedDefinition) => {
    action('Seed Create')(seed);
    return Promise.resolve('6aacf568-ec33-435f-b234-3668534a7f13');
  },
};

const api = new MemoryApiMock();
const backend = new BackendMock();

api.vault.addSeedAddress(
  'e23378da-d4b2-4843-ae4d-f42888a11b58',
  "m/44'/60'/0'/0/0",
  '0xc4cf138d349ead73f7a93306096a626c40f56653',
);
api.vault.addSeedAddress(
  'e23378da-d4b2-4843-ae4d-f42888a11b58',
  "m/44'/61'/0'/0/0",
  '0x75a32a48a215675f822fca1f9d99dadf7c6ec104',
);
api.vault.addSeedAddress(
  'e23378da-d4b2-4843-ae4d-f42888a11b58',
  "m/44'/60'/1'/0/0",
  '0x49dbb473f4fbdc20a4367763351df63553c86824',
);
api.vault.addSeedAddress(
  'e23378da-d4b2-4843-ae4d-f42888a11b58',
  "m/44'/61'/1'/0/0",
  '0x2b59a19f1f4de027d039ac3f24e9b73ddf03386f',
);
api.vault.addSeedAddress(
  'e23378da-d4b2-4843-ae4d-f42888a11b58',
  "m/84'/0'/0'/0/0",
  'bc1qj4zhepcsjp6gpqf252329daum6ey6hhqagccaf',
);
api.vault.addSeedAddress(
  'e23378da-d4b2-4843-ae4d-f42888a11b58',
  "m/84'/0'/1'/0/0",
  'bc1qxqz4qerrm662nt4hxh39mqltvqcffcvzzfc49z',
);

api.vault.addSeedAddress(
  '6aacf568-ec33-435f-b234-3668534a7f13',
  "m/44'/60'/0'/0/0",
  '0xad73f7a93306096a626c40f56653c4cf138d349e',
);
api.vault.addSeedAddress(
  '6aacf568-ec33-435f-b234-3668534a7f13',
  "m/44'/61'/0'/0/0",
  '0xf822fca1f9d99dadf7c6ec10475a32a48a215675',
);
api.vault.addSeedAddress(
  '6aacf568-ec33-435f-b234-3668534a7f13',
  "m/84'/0'/0'/0/0",
  'bc1qnuy60h2qq7zjmj929nha54hcmpveqj6cj07sa6',
);

api.vault.setSeedPassword('e23378da-d4b2-4843-ae4d-f42888a11b58', 'testtesttest');
api.vault.addSeedAddress(
  'e23378da-d4b2-4843-ae4d-f42888a11b58',
  "m/1044'/15167'/8173'/68/164",
  '0x0000000000000000000000000000000000000000',
);

api.vault.setSeedPassword('6aacf568-ec33-435f-b234-3668534a7f13', 'testtesttest');
api.vault.addSeedAddress(
  '6aacf568-ec33-435f-b234-3668534a7f13',
  "m/1044'/15167'/8173'/68/164",
  '0x0000000000000000000000000000000000000000',
);

backend.useBlockchains(['eth', 'etc', 'btc']);
backend.blockchains['eth'].setBalance('0xc4cf138d349ead73f7a93306096a626c40f56653', 'ETH', '150078009050000000');
backend.blockchains['eth'].setBalance('0xc4cf138d349ead73f7a93306096a626c40f56653', 'DAI', '250018500000000000000');
backend.blockchains['eth'].setBalance('0xc4cf138d349ead73f7a93306096a626c40f56653', 'USDT', '41010000000');
backend.blockchains['etc'].setBalance('0x75a32a48a215675f822fca1f9d99dadf7c6ec104', 'ETC', '30400000000000000000');

const blockchains: IBlockchain[] = [
  Blockchains[BlockchainCode.ETC],
  Blockchains[BlockchainCode.ETH],
  Blockchains[BlockchainCode.BTC],
];

storiesOf('CreateWallet', module)
  .addDecorator(providerForStore(api, backend))
  .addDecorator(withTheme)
  .add('empty', () => <CreateWalletWizard seeds={[]} blockchains={blockchains} {...handlers} />)
  .add('single seed', () => {
    const seed: SeedDescription = {
      createdAt: new Date(),
      id: 'e23378da-d4b2-4843-ae4d-f42888a11b58',
      available: true,
      type: 'raw',
    };
    return <CreateWalletWizard seeds={[seed]} blockchains={blockchains} {...handlers} />;
  });

storiesOf('CreateWallet', module)
  .addDecorator(providerForStore(api, backend))
  .addDecorator(withTheme)
  .add('unlock seed', () => {
    return <UnlockSeed seedId="6aacf568-ec33-435f-b234-3668534a7f13" onUnlock={action('unlock')} />;
  });
