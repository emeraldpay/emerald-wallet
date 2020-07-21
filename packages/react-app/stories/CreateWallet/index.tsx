import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import * as React from 'react';
import CreateWalletWizard from "../../src/create-wallet/CreateWalletWizard";
import {providerForStore} from "../storeProvider";
import {SeedDefinition, SeedDescription} from "@emeraldpay/emerald-vault-core";
import {BlockchainCode, Blockchains, IBlockchain} from "@emeraldwallet/core";
import {BackendMock} from "../backendMock";
import withTheme from "../themeProvider";
import UnlockSeed from "../../src/create-account/UnlockSeed";

const handlers = {
  onCreate: (value) => {
    action("Wallet Create")(value);
    return Promise.resolve("6aacf568-ec33-435f-b234-3668534a7f13");
  },
  onError: action("Error"),
  onCancel: action("Cancel"),
  mnemonicGenerator: () => {
    return Promise.resolve("accuse spin gym afraid reunion poverty mango north silk lottery tank bulk hawk sting movie secret copper goose below use pig vintage resource plate");
  },
  onSaveSeed: (seed: SeedDefinition) => {
    action("Seed Create")(seed);
    return Promise.resolve("6aacf568-ec33-435f-b234-3668534a7f13");
  }
}

const backend = new BackendMock();
backend.vault.addSeedAddress("e23378da-d4b2-4843-ae4d-f42888a11b58",
  "m/44'/60'/0'/0/0", "0xc4cf138d349ead73f7a93306096a626c40f56653");
backend.vault.addSeedAddress("e23378da-d4b2-4843-ae4d-f42888a11b58",
  "m/44'/61'/0'/0/0", "0x75a32a48a215675f822fca1f9d99dadf7c6ec104");
backend.vault.addSeedAddress("e23378da-d4b2-4843-ae4d-f42888a11b58",
  "m/44'/60'/1'/0/0", "0x49dbb473f4fbdc20a4367763351df63553c86824");
backend.vault.addSeedAddress("e23378da-d4b2-4843-ae4d-f42888a11b58",
  "m/44'/61'/1'/0/0", "0x2b59a19f1f4de027d039ac3f24e9b73ddf03386f");

backend.vault.addSeedAddress("6aacf568-ec33-435f-b234-3668534a7f13",
  "m/44'/60'/0'/0/0", "0xad73f7a93306096a626c40f56653c4cf138d349e");
backend.vault.addSeedAddress("6aacf568-ec33-435f-b234-3668534a7f13",
  "m/44'/61'/0'/0/0", "0xf822fca1f9d99dadf7c6ec10475a32a48a215675");

backend.vault.setSeedPassword("6aacf568-ec33-435f-b234-3668534a7f13", "testtesttest");
backend.vault.addSeedAddress("6aacf568-ec33-435f-b234-3668534a7f13",
  "m/1044'/15167'/8173'/68/164", "0x0000000000000000000000000000000000000000");

backend.useBlockchains(["eth", "etc"]);
backend.blockchains["eth"].setBalance(
  "0xc4cf138d349ead73f7a93306096a626c40f56653", "ETH", "150078009050000000"
);
backend.blockchains["eth"].setBalance(
  "0xc4cf138d349ead73f7a93306096a626c40f56653", "DAI", "250018500000000000000"
);
backend.blockchains["eth"].setBalance(
  "0xc4cf138d349ead73f7a93306096a626c40f56653", "USDT", "41010000000"
);
backend.blockchains["etc"].setBalance(
  "0x75a32a48a215675f822fca1f9d99dadf7c6ec104", "ETC", "30400000000000000000"
);

const blockchains: IBlockchain[] = [
  Blockchains[BlockchainCode.ETC],
  Blockchains[BlockchainCode.ETH]
]

storiesOf('CreateWallet', module)
  .addDecorator(providerForStore(backend))
  .addDecorator(withTheme)
  .add('empty', () => (
    <CreateWalletWizard
      seeds={[]}
      blockchains={blockchains}
      {...handlers}
    />
  ))
  .add("single seed", () => {
    const seed: SeedDescription = {
      createdAt: new Date(),
      id: "e23378da-d4b2-4843-ae4d-f42888a11b58",
      available: true,
      type: "raw"
    };
    return <CreateWalletWizard
      seeds={[seed]}
      blockchains={blockchains}
      {...handlers}
    />
  });

storiesOf('CreateWallet', module)
  .addDecorator(providerForStore(backend))
  .addDecorator(withTheme)
  .add("unlock seed", () => {
    return <UnlockSeed seedId="6aacf568-ec33-435f-b234-3668534a7f13" onUnlock={action("unlock")}/>
  })
