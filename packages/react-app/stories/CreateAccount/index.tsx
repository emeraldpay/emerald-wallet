import {storiesOf} from '@storybook/react';
import * as React from 'react';
import {providerForStore} from "../storeProvider";
import withTheme from '../themeProvider';
import HDPathCounter from "../../src/create-account/HDPathCounter";
import SelectHDPath from "../../src/create-account/SelectHDPath";
import {BackendMock} from "../backendMock";
import {BlockchainCode, Blockchains} from "@emeraldwallet/core";
import SelectCoins from "../../src/create-account/SelectCoins";
import {action} from "@storybook/addon-actions";
import {ledgerSeedId} from "../wallets";

const backend = new BackendMock();
backend.vault.addSeedAddress("e23378da-d4b2-4843-ae4d-f42888a11b58",
  "m/44'/60'/0'/0/0", "0xc4cf138d349ead73f7a93306096a626c40f56653");
backend.vault.addSeedAddress("e23378da-d4b2-4843-ae4d-f42888a11b58",
  "m/44'/61'/0'/0/0", "0x75a32a48a215675f822fca1f9d99dadf7c6ec104");
backend.vault.addSeedAddress("e23378da-d4b2-4843-ae4d-f42888a11b58",
  "m/44'/60'/1'/0/0", "0x49dbb473f4fbdc20a4367763351df63553c86824");
backend.vault.addSeedAddress("e23378da-d4b2-4843-ae4d-f42888a11b58",
  "m/44'/61'/1'/0/0", "0x2b59a19f1f4de027d039ac3f24e9b73ddf03386f");

backend.useBlockchains(["eth", "etc"]);
backend.blockchains["eth"].setBalance(
  "0xc4cf138d349ead73f7a93306096a626c40f56653", "ETH", "150078009050000000/WEI"
);
backend.blockchains["eth"].setBalance(
  "0xc4cf138d349ead73f7a93306096a626c40f56653", "DAI", "250018500000000000000/DAI"
);
backend.blockchains["eth"].setBalance(
  "0xc4cf138d349ead73f7a93306096a626c40f56653", "USDT", "41010000000/USDT"
);
backend.blockchains["etc"].setBalance(
  "0x75a32a48a215675f822fca1f9d99dadf7c6ec104", "ETC", "30400000000000000000/WEI"
);

storiesOf('CreateAccount', module)
  .addDecorator(withTheme)
  .addDecorator(providerForStore(backend))
  .add('select account', () => (
    <SelectHDPath
      seed={{type: "id", value: "e23378da-d4b2-4843-ae4d-f42888a11b58"}}
      blockchains={[BlockchainCode.ETH, BlockchainCode.ETC]}
      onChange={(n) => console.log("Account selected", n)}
    />
  ))
  .add('select account, only ETH', () => (
    <SelectHDPath
      seed={{type: "id", value: "e23378da-d4b2-4843-ae4d-f42888a11b58"}}
      blockchains={[BlockchainCode.ETH]}
      onChange={(n) => console.log("Account selected", n)}
    />
  ))
  .add('select with slow read of xpub', () => (
    <SelectHDPath
      seed={{type: "id", value: ledgerSeedId}}
      blockchains={[BlockchainCode.ETH, BlockchainCode.BTC]}
      onChange={(n) => console.log("Account selected", n)}
    />
  ))
  .add('just HDPath counter', () => (
    <HDPathCounter
      base={"m/44'/60'/0'/0/0"}
      onChange={(value) => {
      }}
    />
  ))
  .add('just HDPath counter with disabled 0,3,4', () => (
    <HDPathCounter
      base={"m/44'/60'/0'/0/0"}
      disabled={[0, 3, 4]}
      onChange={(value) => {
      }}
    />
  ))
  .add('select blockchain when empty', () => (
    <SelectCoins multiple={true}
                 blockchains={[Blockchains[BlockchainCode.ETH], Blockchains[BlockchainCode.ETC]]}
                 enabled={[]}
                 onChange={action("selected")}/>
  ))
  .add('select blockchain when one is set', () => (
    <SelectCoins multiple={true}
                 blockchains={[Blockchains[BlockchainCode.ETH], Blockchains[BlockchainCode.ETC], Blockchains[BlockchainCode.Kovan]]}
                 enabled={[BlockchainCode.ETH]}
                 onChange={action("selected")}/>
  ))
  .add('select single blockchain', () => (
    <SelectCoins multiple={false}
                 blockchains={[Blockchains[BlockchainCode.ETH], Blockchains[BlockchainCode.ETC]]}
                 enabled={[]}
                 onChange={action("selected")}/>
  ))
;
