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
    expect(act.items[0].address.address).toEqual(item.address.address);
  });

  test("add an get item", async () => {
    let item: AddressbookItem = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      address: {
        type: "plain",
        address: "0x2EA8846a26B6af5F63CAAe912BB3c4064B94D54B"
      }
    };
    let id = await state.addressbook.add(item);

    let act = await state.addressbook.get(id);
    expect(act).toBeDefined();
    expect(act!!.address.address).toEqual(item.address.address);
    expect(act!!.address.currentAddress).toEqual(item.address.address);
  });

  test("adding xpub as plain sets the correct type", async () => {
    let item: AddressbookItem = {
      blockchain: blockchainCodeToId(BlockchainCode.BTC),
      address: {
        type: "plain",
        //amused ankle enable chuckle doll above flee oval virtual throw danger kind oblige surge crumble
        address: "zpub6tviAxktqYSfSuMMd35WPKK8yiET4CcQQzg7bVcEep7E53jiUv9hBizBCLERcAa57nhPtXPCTGbBJ81r9wHnzEPUXGn9AL5cdEmMAKLJH5F"
      }
    };
    let id = await state.addressbook.add(item);

    let act = await state.addressbook.get(id);
    expect(act).toBeDefined();
    expect(act!!.address.address).toBe("zpub6tviAxktqYSfSuMMd35WPKK8yiET4CcQQzg7bVcEep7E53jiUv9hBizBCLERcAa57nhPtXPCTGbBJ81r9wHnzEPUXGn9AL5cdEmMAKLJH5F");
    expect(act!!.address.type).toBe("xpub");
    expect(act!!.address.currentAddress).toBe("bc1quj6e5fg6uj236jhynnwa84sxs6dzd25lpnptms");
  });

  test("xpub item uses known pos", async () => {
    let item: AddressbookItem = {
      blockchain: blockchainCodeToId(BlockchainCode.BTC),
      address: {
        type: "plain",
        //amused ankle enable chuckle doll above flee oval virtual throw danger kind oblige surge crumble
        address: "zpub6tviAxktqYSfSuMMd35WPKK8yiET4CcQQzg7bVcEep7E53jiUv9hBizBCLERcAa57nhPtXPCTGbBJ81r9wHnzEPUXGn9AL5cdEmMAKLJH5F"
      }
    };
    let id = await state.addressbook.add(item);
    await state.xpubpos.set_at_least(item.address.address, 4);

    let act = await state.addressbook.get(id);
    expect(act).toBeDefined();
    expect(act!!.address.address).toBe("zpub6tviAxktqYSfSuMMd35WPKK8yiET4CcQQzg7bVcEep7E53jiUv9hBizBCLERcAa57nhPtXPCTGbBJ81r9wHnzEPUXGn9AL5cdEmMAKLJH5F");
    expect(act!!.address.currentAddress).toBe("bc1qvetem3yt77xfn5sn0yc2rdfahcayvh2d63kp60");
  });

  test("return nothing for non existing id", async () => {
    let item: AddressbookItem = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      address: {
        type: "plain",
        address: "0x2EA8846a26B6af5F63CAAe912BB3c4064B94D54B"
      }
    };
    let id = await state.addressbook.add(item);
    let otherId = "a43e0aa5-7d07-43cb-81d3-fe21be748a2d";
    expect(id == otherId).toBeFalsy();
    let act = await state.addressbook.get(otherId);
    expect(act).toBeNull();

    let existing = await state.addressbook.get(id);
    expect(existing).toBeDefined();
  });

  test("update label", async () => {
    let item: AddressbookItem = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      address: {
        type: "plain",
        address: "0x2EA8846a26B6af5F63CAAe912BB3c4064B94D54B"
      }
    };
    let id = await state.addressbook.add(item);

    let updated = await state.addressbook.update(id, {label: "test"});
    expect(updated).toBeTruthy();

    let act = await state.addressbook.query();
    expect(act.items.length).toBe(1);
    expect(act.items[0].label).toBe("test");
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
