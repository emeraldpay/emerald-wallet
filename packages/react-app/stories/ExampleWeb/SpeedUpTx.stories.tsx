import {providerForStore} from "../storeProvider";
import {Meta} from "@storybook/react";
import * as React from 'react';
import {accounts, StoredTransaction, tokens, TxAction, txStash} from "@emeraldwallet/store";
import {CreateTransaction} from "../../src/transaction";
import {BackendMock, MemoryApiMock} from "../__mocks__";
import {WalletEntry} from "@emeraldpay/emerald-vault-core";
import {BlockchainCode, TokenRegistry, workflow} from "@emeraldwallet/core";
import {State, Status} from "@emeraldwallet/core/lib/persistentState";

const api = new MemoryApiMock();
const backend = new BackendMock();

const entries: WalletEntry[] = [
  {
    id: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1',
    address: {
      type: 'single',
      value: '0x0',
    },
    key: {
      type: 'hd-path',
      hdPath: "m/44'/60'/0'/0/0",
      seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
    },
    blockchain: 100,
    createdAt: new Date(),
  },
];

let actions = [
  accounts.actions.setWalletsAction([
    {
      entries,
      id: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9',
      createdAt: new Date(),
    },
  ]),
  {
    type: 'LAUNCHER/TOKENS',
    payload: [
      {
        name: 'Wrapped Ether',
        blockchain: 100,
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        symbol: 'WETH',
        decimals: 18,
        type: 'ERC20',
      },
    ],
  },

  accounts.actions.setBalanceAction({
    address: '0x0',
    balance: '1000000000000000000/WEI',
    entryId: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1',
  }),
  tokens.actions.setTokenBalance(BlockchainCode.ETH, '0x0', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', {
    decimals: 18,
    symbol: 'WETH',
    unitsValue: '1000000000000000000',
  }),

  txStash.actions.setTransaction({
    blockchain: BlockchainCode.ETH,
    amount: '1000000000000000000/WEI',
    asset: 'ETH',
    target: workflow.TxTarget.MANUAL,
    type: "transfer",
    meta: {
      type: workflow.TxMetaType.ETHER_SPEEDUP,
    }
  }),
];

// @ts-ignore
let prevTx: StoredTransaction = {
  blockchain: 100,
  changes: [],
  convertChanges: undefined,
  meta: {
    txId: "0xaa27674ddc77824e50d3c442c12e1d5bb6bb7c88ffa6d41ac14f583b86aa2c7c",
    blockchain: BlockchainCode.ETH,
    timestamp: new Date(),
  },
  sinceTimestamp:  new Date(),
  state: State.SUBMITTED,
  status: Status.UNKNOWN,
  txId: "0xaa27674ddc77824e50d3c442c12e1d5bb6bb7c88ffa6d41ac14f583b86aa2c7c",
}

export default {
  title: 'Example Web / Speed Up Tx',
  decorators: [providerForStore(api, backend, actions),],
} as Meta;

export const Default = {
  name: 'Speed Up  Tx',
  render: () => <CreateTransaction action={TxAction.SPEEDUP} storedTx={prevTx} entryId="2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1" />
};
