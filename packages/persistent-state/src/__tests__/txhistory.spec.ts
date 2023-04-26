import { BlockchainCode, PersistentState, blockchainCodeToId } from '@emeraldwallet/core';
import { tempPath } from './_commons';
import { PersistentStateManager } from '../api';

const { ChangeType, Direction, State, Status } = PersistentState;

describe('Tx History', () => {
  let manager: PersistentStateManager;

  beforeEach(() => {
    manager = new PersistentStateManager(tempPath('tx-history'));
  });

  afterEach(() => {
    manager.close();
  });

  test('empty query', async () => {
    const act = await manager.txhistory.query();

    expect(act).toEqual({ items: [], cursor: null });
  });

  test('add a tx and query all', async () => {
    const tx: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [],
      sinceTimestamp: new Date('2021-03-05T10:11:12Z'),
      state: State.PREPARED,
      status: Status.UNKNOWN,
      txId: '0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
    };

    await manager.txhistory.submit(tx);

    const act = await manager.txhistory.query();

    expect(act).toEqual({ items: [{ ...tx, version: 0 }], cursor: null });
    // make sure it's actual date, not a string. a date keeps timezone and millis
    expect(act.items[0].sinceTimestamp.toISOString()).toBe('2021-03-05T10:11:12.000Z');
  });

  test('filter by state', async () => {
    const tx: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [],
      sinceTimestamp: new Date('2021-03-05T10:11:12Z'),
      state: State.PREPARED,
      status: Status.UNKNOWN,
      txId: '0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
    };

    await manager.txhistory.submit(tx);

    const actPrepared = await manager.txhistory.query({ state: State.PREPARED });
    expect(actPrepared).toEqual({ items: [{ ...tx, version: 0 }], cursor: null });

    const actDropped = await manager.txhistory.query({ state: State.DROPPED });
    expect(actDropped).toEqual({ items: [], cursor: null });

    const actAll = await manager.txhistory.query();
    expect(actAll).toEqual({ items: [{ ...tx, version: 0 }], cursor: null });
  });

  test('filter by state', async () => {
    const tx: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [],
      sinceTimestamp: new Date('2021-03-05T10:11:12Z'),
      state: State.PREPARED,
      status: Status.UNKNOWN,
      txId: '0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
    };

    await manager.txhistory.submit(tx);

    const actUnknown = await manager.txhistory.query({ status: Status.UNKNOWN });
    expect(actUnknown).toEqual({ items: [{ ...tx, version: 0 }], cursor: null });

    const actOk = await manager.txhistory.query({ status: Status.OK });
    expect(actOk).toEqual({ items: [], cursor: null });

    const actAll = await manager.txhistory.query();
    expect(actAll).toEqual({ items: [{ ...tx, version: 0 }], cursor: null });
  });

  test('add a tx and query using cursor', async () => {
    for (let i = 0; i < 10; i++) {
      const tx: PersistentState.Transaction = {
        blockchain: blockchainCodeToId(BlockchainCode.ETH),
        changes: [],
        sinceTimestamp: new Date(`2021-03-05T10:00:${25 - i}`),
        state: State.PREPARED,
        status: Status.UNKNOWN,
        txId: `0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc4400${i}`,
      };

      await manager.txhistory.submit(tx);
    }

    const page1 = await manager.txhistory.query({}, { limit: 5 });

    expect(page1.items.length).toBe(5);
    expect(page1.items[0].txId).toBe('0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44000');
    expect(page1.cursor).toBeDefined();

    const page2 = await manager.txhistory.query({}, { cursor: page1.cursor, limit: 5 });

    expect(page2.items.length).toBe(5);
    expect(page2.items[0].txId).toBe('0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44005');
  });

  test('add a tx returns itself', async () => {
    const tx: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [],
      sinceTimestamp: new Date('2021-03-05T10:11:12Z'),
      state: State.PREPARED,
      status: Status.UNKNOWN,
      txId: '0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
    };

    const act = await manager.txhistory.submit(tx);

    expect(act).toBeDefined();
    expect(act.txId).toBe('0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563');
    // make sure it's actual date, not a string. a date keeps timezone and millis
    expect(act.sinceTimestamp.toISOString()).toBe('2021-03-05T10:11:12.000Z');
  });

  test('add a tx, remove it and query all', async () => {
    const tx: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [],
      sinceTimestamp: new Date('2021-03-05T10:11:12'),
      state: State.PREPARED,
      status: Status.UNKNOWN,
      txId: '0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
    };

    await manager.txhistory.submit(tx);
    await manager.txhistory.remove(tx.blockchain, tx.txId);

    const act = await manager.txhistory.query();

    expect(act).toEqual({ items: [], cursor: null });
  });

  test('add couple of txes and query only last', async () => {
    const tx1: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [],
      sinceTimestamp: new Date('2021-01-05T10:11:12'),
      state: State.PREPARED,
      status: Status.UNKNOWN,
      txId: '0x5ec823816f186928c4ab6baae7cc80a837665d9096e0045d4f5d14cf076eb7b5',
    };
    const tx2: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [],
      sinceTimestamp: new Date('2021-03-05T10:11:12'),
      state: State.PREPARED,
      status: Status.UNKNOWN,
      txId: '0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
    };

    await manager.txhistory.submit(tx1);
    await manager.txhistory.submit(tx2);

    const filter: PersistentState.TxHistoryFilter = {
      after: new Date('2021-03-01T00:00:00'),
    };

    const act = await manager.txhistory.query(filter);

    expect(act).toEqual({ items: [{ ...tx2, version: 0 }], cursor: null });
  });

  test('add couple of txes and query by wallet', async () => {
    const tx1: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [
        {
          type: ChangeType.TRANSFER,
          amount: '100001',
          direction: Direction.SPEND,
          wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
          asset: 'ETH',
        },
      ],
      sinceTimestamp: new Date('2021-01-05T10:11:12'),
      state: State.PREPARED,
      status: Status.UNKNOWN,
      txId: '0x5ec823816f186928c4ab6baae7cc80a837665d9096e0045d4f5d14cf076eb7b5',
    };
    const tx2: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [
        {
          type: ChangeType.TRANSFER,
          amount: '100001',
          direction: Direction.EARN,
          wallet: '53c1fdb3-a2fd-4233-8e5c-b3ecc24486c4-1',
          asset: 'ETH',
        },
      ],
      sinceTimestamp: new Date('2021-03-05T10:11:12'),
      state: State.PREPARED,
      status: Status.UNKNOWN,
      txId: '0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
    };

    await manager.txhistory.submit(tx1);
    await manager.txhistory.submit(tx2);

    let filter: PersistentState.TxHistoryFilter = {
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293',
    };

    let act = await manager.txhistory.query(filter);

    expect(act.items.length).toBe(1);
    expect(act.items[0].txId).toBe(tx1.txId);
    expect(act.items[0].changes.length).toBe(1);
    expect(act.items[0].changes[0]).toEqual(tx1.changes[0]);

    filter = {
      wallet: '53c1fdb3-a2fd-4233-8e5c-b3ecc24486c4',
    };

    act = await manager.txhistory.query(filter);

    expect(act.items.length).toBe(1);
    expect(act.items[0].txId).toBe(tx2.txId);

    filter = {
      wallet: '53c1fdb3-a2fd-4233-8e5c-b3ecc24486c4-1',
    };

    act = await manager.txhistory.query(filter);

    expect(act.items.length).toBe(1);
    expect(act.items[0].txId).toBe(tx2.txId);

    filter = {
      wallet: '53c1fdb3-a2fd-4233-8e5c-b3ecc24486c4-2',
    };

    act = await manager.txhistory.query(filter);

    expect(act.items.length).toBe(0);
  });

  test('fresh tx comes before confirmed', async () => {
    const tx1: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [
        {
          type: ChangeType.TRANSFER,
          amount: '100001',
          direction: Direction.SPEND,
          wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
          asset: 'ETH',
        },
      ],
      block: {
        blockId: '0xe7cc80a837d14cf076eb7b55ec823816f186928c4665d9096e0045d4f5ab6baa',
        height: 1000,
        timestamp: new Date('2021-01-05T10:15:23'),
      },
      blockPos: 0,
      sinceTimestamp: new Date('2021-01-05T10:11:12'),
      confirmTimestamp: new Date('2021-01-05T10:15:23'),
      state: State.CONFIRMED,
      status: Status.OK,
      txId: '0x111823816f186928c4ab6baae7cc80a837665d9096e0045d4f5d14cf076eb7b5',
    };
    const tx2: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [
        {
          type: ChangeType.TRANSFER,
          amount: '100001',
          direction: Direction.EARN,
          wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
          asset: 'ETH',
        },
      ],
      sinceTimestamp: new Date('2021-03-05T10:13:12'),
      state: State.PREPARED,
      status: Status.UNKNOWN,
      txId: '0x222a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
    };
    const tx3: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [
        {
          type: ChangeType.TRANSFER,
          amount: '100001',
          direction: Direction.SPEND,
          wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
          asset: 'ETH',
        },
      ],
      block: {
        blockId: '0xec823880a837d14cf076eb7b554f5ab6baa16f186928c4665d9096e0045de7cc',
        height: 1001,
        timestamp: new Date('2021-01-05T10:26:23'),
      },
      blockPos: 0,
      sinceTimestamp: new Date('2021-01-05T10:11:12'),
      confirmTimestamp: new Date('2021-01-05T10:26:23'),
      state: State.CONFIRMED,
      status: Status.OK,
      txId: '0x33328c6eb7b5ae7cc80a837665d90b6ba23816f18696e0045d4f5d14cf075ec8',
    };

    await manager.txhistory.submit(tx1);
    await manager.txhistory.submit(tx2);
    await manager.txhistory.submit(tx3);

    let filter: PersistentState.TxHistoryFilter = {
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293',
    };

    let act = await manager.txhistory.query(filter);

    //console.log("txes", act.items);

    // tx1 and tx3 are confirmed, tx2 just submitted, so it comes first. then tx3 as it more recent
    expect(act.items.length).toBe(3);
    expect(act.items[0].txId).toBe(tx2.txId);
    expect(act.items[1].txId).toBe(tx3.txId);
    expect(act.items[2].txId).toBe(tx1.txId);
  });

  test('empty cursor for a new address', async () => {
    const act = await manager.txhistory.getCursor(
      'xpub661MyMwAqRbcGczjuMoRm6dXaLDEhW1u34gKenbeYqAix21mdUKJyuyu5F1rzYGVxyL6tmgBUAEPrEz92mBXjByMRiJdba9wpnN37RLLAXa',
    );

    expect(act).toBeNull();
  });

  test('updates cursor value', async () => {
    const xpub =
      'xpub661MyMwAqRbcGczjuMoRm6dXaLDEhW1u34gKenbeYqAix21mdUKJyuyu5F1rzYGVxyL6tmgBUAEPrEz92mBXjByMRiJdba9wpnN37RLLAXa';

    const act = await manager.txhistory.getCursor(xpub);

    expect(act).toBeNull();

    await manager.txhistory.setCursor(xpub, 'MDYwNmMzOTctNTBiNy00NjIzLThmOTktYmU5Y2VhMjk3NTc1');

    const act2 = await manager.txhistory.getCursor(xpub);

    expect(act2).toBe('MDYwNmMzOTctNTBiNy00NjIzLThmOTktYmU5Y2VhMjk3NTc1');

    await manager.txhistory.setCursor(xpub, 'NjgyNmY0YWUtOTE3MC00MDIyLTllMDEtNzBhZjZmMjIxYWUy');

    const act3 = await manager.txhistory.getCursor(xpub);

    expect(act3).toBe('NjgyNmY0YWUtOTE3MC00MDIyLTllMDEtNzBhZjZmMjIxYWUy');
  });

  test('save change address', async () => {
    const tx1: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [
        {
          type: ChangeType.TRANSFER,
          address: '0xf958f1dc9290422d3624b72fc871a8ebb0387f56',
          direction: Direction.SPEND,
          amount: '100001',
          wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
          asset: 'ETH',
        },
      ],
      sinceTimestamp: new Date('2021-01-05T10:11:12'),
      state: State.PREPARED,
      status: Status.UNKNOWN,
      txId: '0x5ec823816f186928c4ab6baae7cc80a837665d9096e0045d4f5d14cf076eb7b5',
    };

    await manager.txhistory.submit(tx1);

    const filter: PersistentState.TxHistoryFilter = { wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293' };
    const act = await manager.txhistory.query(filter);

    expect(act.items.length).toBe(1);
    expect(act.items[0].changes[0].address).toBe('0xf958f1dc9290422d3624b72fc871a8ebb0387f56');
  });

  test('save change without wallet', async () => {
    const tx1: PersistentState.Transaction = {
      block: {
        blockId: '0x0dd485a89361967c82b06732d11af9d1c85cc1f2dee7b6cb99ceb64a78f01967',
        height: 4910978,
        timestamp: new Date('2021-06-04T14:14:23.000Z'),
      },
      blockchain: 10005,
      changes: [
        {
          asset: 'ETH',
          address: '0xf958f1dc9290422d3624b72fc871a8ebb0387f56',
          amount: '50000000000000000000',
          direction: Direction.EARN,
          type: ChangeType.TRANSFER,
          wallet: 'e4bf870e-6247-4465-a476-ad99716c38ce-0',
        },
        {
          asset: 'ETH',
          address: '0x8ebb0387f56f958f1d3624b72fc871ac9290422d',
          amount: '50000000000000000000',
          direction: Direction.EARN,
          type: ChangeType.TRANSFER,
        },
      ],
      sinceTimestamp: new Date('2021-06-04T14:14:23.000Z'),
      confirmTimestamp: new Date('2021-06-04T14:14:23.000Z'),
      state: 12,
      status: 0,
      txId: '0x0d732d11af9d1c85cc1f2dee7b6cb99ceb64a78fd485a89361967c82b0601967',
    };

    await manager.txhistory.submit(tx1);

    const filter: PersistentState.TxHistoryFilter = { wallet: 'e4bf870e-6247-4465-a476-ad99716c38ce' };

    const act = await manager.txhistory.query(filter);

    expect(act.items.length).toBe(1);
    expect(act.items[0].changes[0].address).toBe('0xf958f1dc9290422d3624b72fc871a8ebb0387f56');
    expect(act.items[0].changes[0].wallet).toBe('e4bf870e-6247-4465-a476-ad99716c38ce-0');
    expect(act.items[0].changes[1].wallet).toBeUndefined();
  });

  test('merge tx', async () => {
    let txBefore: PersistentState.Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      changes: [
        {
          asset: 'ETH',
          address: '0xf958f1dc9290422d3624b72fc871a8ebb0387f56',
          amount: '50000000000000000000',
          direction: Direction.SPEND,
          type: ChangeType.TRANSFER,
          wallet: 'e4bf870e-6247-4465-a476-ad99716c38ce-0',
        },
        {
          asset: 'ETH',
          address: '0xf958f1dc9290422d3624b72fc871a8ebb0387f56',
          amount: '50000000000',
          direction: Direction.SPEND,
          type: ChangeType.FEE,
          wallet: 'e4bf870e-6247-4465-a476-ad99716c38ce-0',
        },
        {
          asset: 'ETH',
          address: '0x8ebb0387f56f958f1d3624b72fc871ac9290422d',
          amount: '50000000000000000000',
          direction: Direction.EARN,
          type: ChangeType.TRANSFER,
        },
      ],
      sinceTimestamp: new Date('2022-11-23T10:11:12Z'),
      state: State.PREPARED,
      status: Status.UNKNOWN,
      txId: '0xf5292c8d395b4f19a64fe0bbe8c9a59f046c9dc00752455a90507540a130fa69',
    };

    txBefore = await manager.txhistory.submit(txBefore);

    let txAfter = { ...txBefore };

    txAfter.changes = txAfter.changes.filter((change) => change.type !== ChangeType.FEE);
    txAfter.state = State.CONFIRMED;
    txAfter.status = Status.OK;

    txAfter = await manager.txhistory.submit(txAfter);

    expect(txAfter.changes).toEqual(expect.arrayContaining([expect.objectContaining({ type: ChangeType.FEE })]));
    expect(txAfter.state).toEqual(State.CONFIRMED);
    expect(txAfter.status).toEqual(Status.OK);
  });
});
