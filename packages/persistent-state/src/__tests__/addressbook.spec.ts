import {tempPath} from "./_commons";
import {PersistentStateImpl} from "../api";
import {BlockchainCode, blockchainCodeToId} from "@emeraldwallet/core";
import {AddressbookItem} from "@emeraldwallet/core/lib/persisistentState";

describe("Address Book", () => {

  let state: PersistentStateImpl;
  beforeEach(() => {
    state = new PersistentStateImpl(tempPath("addrbook"));
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
