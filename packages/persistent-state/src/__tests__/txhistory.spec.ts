import {tempPath} from "./_commons";
import {PersistentStateImpl} from "../api";
import {ChangeType, TxHistoryFilter, State, Status, Transaction} from "@emeraldwallet/core/lib/persisistentState";
import {BlockchainCode, blockchainCodeToId} from "@emeraldwallet/core";

describe("Tx History", () => {

  let state: PersistentStateImpl;
  beforeEach(() => {
    state = new PersistentStateImpl(tempPath("tx-history"));
  });

  test("empty query", async () => {
    let act = await state.txhistory.query();
    expect(act).toEqual({items: [], cursor: null});
  });

  test("add a tx and query all", async () => {
    let tx: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: "0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563",
      state: State.PREPARED,
      sinceTimestamp: new Date("2021-03-05T10:11:12"),
      status: Status.UNKNOWN,
      changes: []
    };
    await state.txhistory.submit(tx);
    let act = await state.txhistory.query();
    expect(act).toEqual({items: [tx], cursor: null});
    // make sure it's actual date, not a string. a date keeps timezone and millis
    expect(act.items[0].sinceTimestamp.toISOString()).toBe("2021-03-05T15:11:12.000Z");
  });

  test("add a tx, remove it and query all", async () => {
    let tx: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: "0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563",
      state: State.PREPARED,
      sinceTimestamp: new Date("2021-03-05T10:11:12"),
      status: Status.UNKNOWN,
      changes: []
    };
    await state.txhistory.submit(tx);
    await state.txhistory.remove(tx.blockchain, tx.txId);
    let act = await state.txhistory.query();
    expect(act).toEqual({items: [], cursor: null});
  });

  test("add couple of txes and query only last", async () => {
    let tx1: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: "0x5ec823816f186928c4ab6baae7cc80a837665d9096e0045d4f5d14cf076eb7b5",
      state: State.PREPARED,
      sinceTimestamp: new Date("2021-01-05T10:11:12"),
      status: Status.UNKNOWN,
      changes: []
    };
    let tx2: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: "0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563",
      state: State.PREPARED,
      sinceTimestamp: new Date("2021-03-05T10:11:12"),
      status: Status.UNKNOWN,
      changes: []
    };
    await state.txhistory.submit(tx1);
    await state.txhistory.submit(tx2);

    let filter: TxHistoryFilter = {
      after: new Date("2021-03-01T00:00:00")
    }
    let act = await state.txhistory.query(filter);
    expect(act).toEqual({items: [tx2], cursor: null});
  });

  test("add couple of txes and query by  wallet", async () => {
    let tx1: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: "0x5ec823816f186928c4ab6baae7cc80a837665d9096e0045d4f5d14cf076eb7b5",
      state: State.PREPARED,
      sinceTimestamp: new Date("2021-01-05T10:11:12"),
      status: Status.UNKNOWN,
      changes: [
        {
          type: ChangeType.TRANSFER,
          amount: "-100001",
          wallet: "74b0a509-9083-4b12-80bb-e01db1fa2293-1",
          asset: "ETH"
        }
      ]
    };
    let tx2: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: "0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563",
      state: State.PREPARED,
      sinceTimestamp: new Date("2021-03-05T10:11:12"),
      status: Status.UNKNOWN,
      changes: [
        {
          type: ChangeType.TRANSFER,
          amount: "100001",
          wallet: "53c1fdb3-a2fd-4233-8e5c-b3ecc24486c4-1",
          asset: "ETH"
        }
      ]
    };
    await state.txhistory.submit(tx1);
    await state.txhistory.submit(tx2);

    let filter: TxHistoryFilter = {
      wallet: "74b0a509-9083-4b12-80bb-e01db1fa2293"
    }
    let act = await state.txhistory.query(filter);
    expect(act.items.length).toBe(1);
    expect(act.items[0].txId).toBe(tx1.txId);
    expect(act.items[0].changes.length).toBe(1);
    expect(act.items[0].changes[0]).toEqual(tx1.changes[0]);

    filter = {
      wallet: "53c1fdb3-a2fd-4233-8e5c-b3ecc24486c4"
    }
    act = await state.txhistory.query(filter);
    expect(act.items.length).toBe(1);
    expect(act.items[0].txId).toBe(tx2.txId);

    filter = {
      wallet: "53c1fdb3-a2fd-4233-8e5c-b3ecc24486c4-1"
    }
    act = await state.txhistory.query(filter);
    expect(act.items.length).toBe(1);
    expect(act.items[0].txId).toBe(tx2.txId);

    filter = {
      wallet: "53c1fdb3-a2fd-4233-8e5c-b3ecc24486c4-2"
    }
    act = await state.txhistory.query(filter);
    expect(act.items.length).toBe(0);
  });

})
