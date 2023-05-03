import {
  BitcoinRawTransaction,
  BlockchainCode,
  PersistentState,
  TokenRegistry,
  blockchainCodeToId,
} from '@emeraldwallet/core';
import { StoredTransaction, accounts } from '@emeraldwallet/store';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import CreateCancelTransaction from '../../src/transaction/CreateCancelTransaction';
import { MemoryApiMock } from '../__mocks__/apiMock';
import { BackendMock as BackendMockBase } from '../__mocks__/backendMock';
import { providerForStore } from '../storeProvider';
import withTheme from '../themeProvider';

const { ChangeType, Direction, State, Status } = PersistentState;

class BackendMock extends BackendMockBase {
  getBtcTx(): Promise<BitcoinRawTransaction | null> {
    return Promise.resolve({
      vout: [
        {
          scriptPubKey: {
            address: 'tb1q2h3wgjasuprzrmcljkpkcyeh69un3r0tzf9nnn',
          },
          value: 0.00001,
        },
        {
          scriptPubKey: {
            address: 'tb1q8grga8c48wa4dsevt0v0gcl6378rfljj6vrz0u',
          },
          value: 0.01208976,
        },
      ],
      vin: [
        {
          txid: 'fd53023c4a9627c26c5d930f3149890b2eecf4261f409bd1a340454b7dede244',
          sequence: 0,
          vout: 0,
        },
      ],
    });
  }
}

const blockchainId = blockchainCodeToId(BlockchainCode.BTC);

const api = new MemoryApiMock();
const backend = new BackendMock();
const tokenRegistry = new TokenRegistry([]);

api.balances.set({
  address:
    'vpub5b2pFUoFBwGLT1jwWQ69V2hCi7nhLTy67k1NkfSxhEfYknh1uSLF' +
    'o6v4oXeBv7PuoxVAFKyjrai2zdcSG82venvnSwmsUhFXET6Mhb4wUqN',
  amount: '0.01210185',
  asset: 'BTC',
  blockchain: blockchainId,
  utxo: [
    {
      amount: '1210185',
      txid: 'fd53023c4a9627c26c5d930f3149890b2eecf4261f409bd1a340454b7dede244',
      vout: 0,
    },
  ],
});

api.vault.addEntry('2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1', {
  address: 'tb1qjg445dvh6krr6gtmuh4eqgua372vxaf4q07nv9',
  hdPath: "m/84'/1'/0'/1/0",
  role: 'change',
});
api.vault.addEntry('2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1', {
  address: 'tb1q8grga8c48wa4dsevt0v0gcl6378rfljj6vrz0u',
  hdPath: "m/84'/1'/0'/1/1",
  role: 'change',
});

const tx = new StoredTransaction(
  tokenRegistry,
  {
    blockchain: blockchainId,
    changes: [
      {
        address: 'tb1qjg445dvh6krr6gtmuh4eqgua372vxaf4q07nv9',
        amount: '1210185',
        asset: 'BTC',
        direction: Direction.SPEND,
        type: ChangeType.TRANSFER,
        wallet: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1',
      },
      {
        address: 'tb1q2h3wgjasuprzrmcljkpkcyeh69un3r0tzf9nnn',
        amount: '1000',
        asset: 'BTC',
        direction: Direction.EARN,
        type: ChangeType.TRANSFER,
      },
      {
        address: 'tb1q8grga8c48wa4dsevt0v0gcl6378rfljj6vrz0u',
        amount: '1208976',
        asset: 'BTC',
        direction: Direction.EARN,
        type: ChangeType.TRANSFER,
        wallet: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1',
      },
    ],
    sinceTimestamp: new Date('2022-01-01T10:00:00'),
    state: State.PREPARED,
    status: Status.UNKNOWN,
    txId: 'f0b3ef3ee04f8879f82fd0a1fd2e1d0c3576522d5aa75a6f724a6690e6c3b971',
  },
  null,
);

storiesOf('ModifyTx', module)
  .addDecorator(
    providerForStore(api, backend, [
      accounts.actions.setWalletsAction([
        {
          id: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9',
          createdAt: new Date(),
          entries: [
            {
              id: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1',
              blockchain: blockchainId,
              createdAt: new Date(),
              address: {
                type: 'single',
                value: 'xpub',
              },
              key: {
                type: 'hd-path',
                hdPath: "m/84'/1'/0'/0/0",
                seedId: '28a0de6c-1721-496a-a8ec-beef05e8ede0',
              },
              xpub: [
                {
                  role: 'change',
                  xpub:
                    'vpub5b2pFUoFBwGLT1jwWQ69V2hCi7nhLTy67k1NkfSxhEfYknh1uSLF' +
                    'o6v4oXeBv7PuoxVAFKyjrai2zdcSG82venvnSwmsUhFXET6Mhb4wUqN',
                },
                {
                  role: 'receive',
                  xpub:
                    'vpub5b2pFUoFBwGLQK7qL5PfTGcqpwF2ZgVigxeuGAX7yi1yLvJQzvv4' +
                    '5pKp1ttKczCRZUyksSr55Mma9F9h6kH6zqX7sGS2Z3TumLV5DFGYaji',
                },
              ],
            },
          ],
        },
      ]),
    ]),
  )
  .addDecorator(withTheme)
  .add('cancel bitcoin', () => <CreateCancelTransaction entryId={'2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1'} tx={tx} />);
