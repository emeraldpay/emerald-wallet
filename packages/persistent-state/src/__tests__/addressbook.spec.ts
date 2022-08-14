import {tempPath} from "./_commons";
import {PersistentStateImpl} from "../api";
import {BlockchainCode, blockchainCodeToId} from "@emeraldwallet/core";
import {AddressbookItem} from "@emeraldwallet/core/lib/persisistentState";

describe("Address Book", () => {

  let state: PersistentStateImpl;
  beforeEach(() => {
    state = new PersistentStateImpl(tempPath("addrbook"));
  });
  afterEach( () => {
    state.close();
  });

  test("empty query", async () => {
    let act = await state.addressbook.query();
    expect(act).toEqual({items: [], cursor: null});
  });

  test("add an item and query all", async () => {
    let item: AddressbookItem = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      address: {
        type: "plain",
        address: "0x2EA8846a26B6af5F63CAAe912BB3c4064B94D54B"
      }
    };
    let id = await state.addressbook.add(item);
    let act = await state.addressbook.query();
    expect(act.items.length).toBe(1);
    expect(act.items[0].id).toBe(id);
    expect(act.items[0].address).toEqual(item.address);
  });

  test("add an item and query using cursor", async () => {
    for (let i = 0; i < 10; i++) {
      let item: AddressbookItem = {
        blockchain: blockchainCodeToId(BlockchainCode.ETH),
        address: {
          type: "plain",
          address: `0x2EA8846a26B6af5F63CAAe912BB3c4064B94D50${i}`
        }
      };
      await state.addressbook.add(item);
    }
    let page1 = await state.addressbook.query({}, {limit: 5});
    expect(page1.items.length).toBe(5);
    expect(page1.items[0].address.address).toBe("0x2EA8846a26B6af5F63CAAe912BB3c4064B94D509");
    expect(page1.cursor).toBeDefined();

    let page2 = await state.addressbook.query({}, {limit: 5, cursor: page1.cursor});
    expect(page2.items.length).toBe(5);
    expect(page2.items[0].address.address).toBe("0x2EA8846a26B6af5F63CAAe912BB3c4064B94D504");
  });

  test("add an item, remove and query all", async () => {
    let item: AddressbookItem = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      address: {
        type: "plain",
        address: "0x2EA8846a26B6af5F63CAAe912BB3c4064B94D54B"
      }
    };
    let id = await state.addressbook.add(item);
    let deleted = await state.addressbook.remove(id);
    let act = await state.addressbook.query();
    expect(act.items.length).toBe(0);
  });
})
