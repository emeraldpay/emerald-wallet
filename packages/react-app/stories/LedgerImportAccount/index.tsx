import { IApi } from '@emeraldwallet/core';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import ImportAccount from '../../src/ledger/ImportAccount/ImportAccount';

storiesOf('LedgerImportAccount', module)
  .add('default', () => (
    <ImportAccount
      api={{} as IApi}
      blockchains={[]}
      hdbase="m/44'/60'/160720'/0'"
      selected={false}
      addresses={[
        { address: '0x9FCaFcca8aec0367abB35fBd161c241f7b79891B', hdpath: "m/44'/60'/160720'/0'" },
        { address: '0x2b66DD4EB5af85ebFcCD4b538E87729FB9556764', hdpath: "m/44'/60'/160720'/0'" }
      ]}
    />
  ))
  .add('with selected', () => (
    <ImportAccount
      api={{} as IApi}
      blockchains={[]}
      hdbase="m/44'/60'/160720'/0'"
      selected={false}
      selectedAddress='0x9FCaFcca8aec0367abB35fBd161c241f7b79891B'
      addresses={[
        { address: '0x9FCaFcca8aec0367abB35fBd161c241f7b79891B', hdpath: "m/44'/60'/160720'/0'" },
        { address: '0x2b66DD4EB5af85ebFcCD4b538E87729FB9556764', hdpath: "m/44'/60'/160720'/0'" }
      ]}
    />
  ));
