import { tempPath } from './_commons';
import { PersistentStateImpl } from '../api';
import { BlockchainCode, blockchainCodeToId } from '@emeraldwallet/core';
import { PersistentState } from '@emeraldwallet/core';

describe('Address Book', () => {
  let path: string;
  let state: PersistentStateImpl;

  beforeEach(() => {
    path = tempPath('addrbook');
    state = new PersistentStateImpl(path);
  });

  afterEach(() => {
    state.close();
  });
  afterEach( () => {
    state.close();
  });

  test('empty query', async () => {
    const act = await state.addressbook.query();

    expect(act).toEqual({ items: [], cursor: null });
  });

  test('add an item and query all', async () => {
    const item: PersistentState.AddressbookItem = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      address: {
        type: 'plain',
        address: '0x2EA8846a26B6af5F63CAAe912BB3c4064B94D54B',
      },
    };

    const id = await state.addressbook.add(item);
    const act = await state.addressbook.query();

    expect(act.items.length).toBe(1);
    expect(act.items[0].id).toBe(id);
    expect(act.items[0].address).toEqual(item.address);
  });

  test("add an item and query using cursor", async () => {
    for (let i = 0; i < 10; i++) {
      const item: PersistentState.AddressbookItem = {
        blockchain: blockchainCodeToId(BlockchainCode.ETH),
        address: {
          type: "plain",
          address: `0x2EA8846a26B6af5F63CAAe912BB3c4064B94D50${i}`
        }
      };

      await state.addressbook.add(item);
    }

    const page1 = await state.addressbook.query({}, { limit: 5 });

    expect(page1.items.length).toBe(5);
    expect(page1.items[0].address.address).toBe("0x2EA8846a26B6af5F63CAAe912BB3c4064B94D509");
    expect(page1.cursor).toBeDefined();

    const page2 = await state.addressbook.query({}, { cursor: page1.cursor, limit: 5 });

    expect(page2.items.length).toBe(5);
    expect(page2.items[0].address.address).toBe("0x2EA8846a26B6af5F63CAAe912BB3c4064B94D504");
  });

  test('add an item, remove and query all', async () => {
    const item: PersistentState.AddressbookItem = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      address: {
        type: 'plain',
        address: '0x2EA8846a26B6af5F63CAAe912BB3c4064B94D54B',
      },
    };

    const id = await state.addressbook.add(item);
    await state.addressbook.remove(id);
    const act = await state.addressbook.query();

    expect(act.items.length).toBe(0);
  });

  test('add an item, query all, close state, open state and query all', async () => {
    const item: PersistentState.AddressbookItem = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      address: {
        type: 'plain',
        address: '0x2EA8846a26B6af5F63CAAe912BB3c4064B94D54B',
      },
    };

    await state.addressbook.add(item);
    let act = await state.addressbook.query();

    expect(act.items.length).toBe(1);

    state.close();
    state = new PersistentStateImpl(path);

    act = await state.addressbook.query();

    expect(act.items.length).toBe(1);
  });
});
