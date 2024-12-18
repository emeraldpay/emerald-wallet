import {providerForStore} from "../storeProvider";
import {Meta, type StoryObj} from "@storybook/react";
import {BackendMock, MemoryApiMock} from "../__mocks__";
import {accounts, CreateTxStage, settings, txStash} from "@emeraldwallet/store";
import * as React from "react";
import {SignTransaction} from "../../src/transaction/SignTransaction";
import {EthereumPlainTx, TxMetaType} from "@emeraldwallet/core/lib/transaction/workflow";
import {BlockchainCode, Blockchains, workflow} from "@emeraldwallet/core";
import {WalletEntry} from "@emeraldpay/emerald-vault-core";
import ContactForm from "../../src/address-book/ContactForm/ContactForm";
import {action} from "@storybook/addon-actions";

const api = new MemoryApiMock();
const backend = new BackendMock();

const entry1: WalletEntry = {
  id: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1',
  address: {
    type: 'single',
    value: '0x000000000000',
  },
  key: {
    type: 'hd-path',
    hdPath: "m/44'/60'/0'/0/0",
    seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
  },
  blockchain: 100,
  createdAt: new Date(),
}

const tx1: EthereumPlainTx = {
  meta: {
    type: TxMetaType.ETHER_TRANSFER,
  },
  target: 0,
  type: "foo",
  blockchain: BlockchainCode.ETH,
  gas: 21_000,
  amount: "158185076234567891/WEI",
  asset: "ETH",
  nonce: 10,
  gasPrice: "692134567/WEI"
}

const tx2: EthereumPlainTx = Object.assign({}, tx1,
  {
  gas: 72_510,
  amount: "919505076234567891/WEI",
})

let actions = [
  accounts.actions.setWalletsAction([
    {
      entries: [entry1],
      id: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9',
      createdAt: new Date(),
    },
  ]),
  txStash.actions.setStage(CreateTxStage.SETUP),
  txStash.actions.setEntry(entry1),
  settings.actions.setRates({
    ETH: "3820.12"
  })
];

export default {
  title: 'Create Transaction - Sign',
  component: SignTransaction,
  decorators: [
    providerForStore(api, backend, [...actions]),
  ],
} as Meta;

type Story = StoryObj<typeof SignTransaction>;

export const Sign: Story = {
  name: 'Sign',
  args: {
    onCancel: action('cancel'),
    // @ts-ignore
    _test_actions: [txStash.actions.setTransaction(tx1)]
  }
};

export const SignContract: Story = {
  name: 'Sign Contract',
  args: {
    onCancel: action('cancel'),
    // @ts-ignore
    _test_actions: [txStash.actions.setTransaction(tx2)]
  }
};

