import { BlockchainCode, blockchainCodeToId } from '@emeraldwallet/core';
import {
  ChangeType,
  Direction,
  State,
  Status,
  Transaction,
  TxHistoryFilter,
} from '@emeraldwallet/core/lib/persisistentState';
import { PersistentStateImpl } from '../api';
import { tempPath } from './_commons';
import { Wei } from '@emeraldpay/bigamount-crypto';

describe('Tx History', () => {
  let state: PersistentStateImpl;
  beforeEach(() => {
    state = new PersistentStateImpl(tempPath('tx-history'));
  });

  afterEach(() => {
    // close current after each test, otherwise it may reuse same instance for the next text
    state.close();
  })

  test('empty query', async () => {
    const act = await state.txhistory.query();
    expect(act).toEqual({ items: [], cursor: null });
  });

  test('add a tx and query all', async () => {
    const tx: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: '0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
      state: State.PREPARED,
      sinceTimestamp: new Date('2021-03-05T10:11:12.000+0300'),
      status: Status.UNKNOWN,
      changes: [],
    };
    await state.txhistory.submit(tx);
    const act = await state.txhistory.query();
    expect(act).toEqual({ items: [tx], cursor: null });
    // make sure it's actual date, not a string. a date keeps timezone and millis
    expect(act.items[0].sinceTimestamp.toISOString()).toBe('2021-03-05T07:11:12.000Z');
  });

  test('submitting a tx returns itself', async () => {
    const tx: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: '0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
      state: State.PREPARED,
      sinceTimestamp: new Date('2021-03-05T10:11:12.000+0300'),
      status: Status.UNKNOWN,
      changes: [],
    };
    const act = await state.txhistory.submit(tx);
    expect(act).toEqual(tx);
    // make sure it's actual date, not a string. a date keeps timezone and millis
    expect(act.sinceTimestamp.toISOString()).toBe('2021-03-05T07:11:12.000Z');
  });

  test('add a tx, remove it and query all', async () => {
    const tx: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: '0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
      state: State.PREPARED,
      sinceTimestamp: new Date('2021-03-05T10:11:12'),
      status: Status.UNKNOWN,
      changes: [],
    };
    await state.txhistory.submit(tx);
    await state.txhistory.remove(tx.blockchain, tx.txId);
    const act = await state.txhistory.query();
    expect(act).toEqual({ items: [], cursor: null });
  });

  test('add couple of txes and query only last', async () => {
    const tx1: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: '0x5ec823816f186928c4ab6baae7cc80a837665d9096e0045d4f5d14cf076eb7b5',
      state: State.PREPARED,
      sinceTimestamp: new Date('2021-01-05T10:11:12'),
      status: Status.UNKNOWN,
      changes: [],
    };
    const tx2: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: '0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
      state: State.PREPARED,
      sinceTimestamp: new Date('2021-03-05T10:11:12'),
      status: Status.UNKNOWN,
      changes: [],
    };
    await state.txhistory.submit(tx1);
    await state.txhistory.submit(tx2);

    const filter: TxHistoryFilter = {
      after: new Date('2021-03-01T00:00:00'),
    };
    const act = await state.txhistory.query(filter);
    expect(act).toEqual({ items: [tx2], cursor: null });
  });

  test('saves change direction', async () => {
    const tx1: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: '0xaae7cc28c4ab6b4cf076eb7b580a837665d9096e0045d4f5d15ec823816f1869',
      state: State.CONFIRMED,
      sinceTimestamp: new Date('2021-01-05T10:11:12'),
      status: Status.UNKNOWN,
      changes: [
        {
          type: ChangeType.TRANSFER,
          amount: '100001',
          direction: Direction.SPEND,
          wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
          asset: 'ETH',
        },
        {
          type: ChangeType.TRANSFER,
          amount: '100001',
          direction: Direction.EARN,
          wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
          asset: 'ETH',
        },
      ],
    };

    await state.txhistory.submit(tx1);


    const all = await state.txhistory.query();
    const act = all.items[0] as Transaction;
    expect(act.changes.length).toBe(2);
    expect(act.changes[0].direction).toBe("SPEND");
    expect(act.changes[1].direction).toBe("EARN");
  });

  test('add couple of txes and query by  wallet', async () => {
    const tx1: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: '0x5ec823816f186928c4ab6baae7cc80a837665d9096e0045d4f5d14cf076eb7b5',
      state: State.PREPARED,
      sinceTimestamp: new Date('2021-01-05T10:11:12'),
      status: Status.UNKNOWN,
      changes: [
        {
          type: ChangeType.TRANSFER,
          amount: '-100001',
          amountValue: new Wei('-100001'),
          direction: Direction.SPEND,
          wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293-1',
          asset: 'ETH',
        },
      ],
    };
    const tx2: Transaction = {
      blockchain: blockchainCodeToId(BlockchainCode.ETH),
      txId: '0xd91a058f994b6844bfd225b8acd1062b2402143487b2b8118ea50a854dc44563',
      state: State.PREPARED,
      sinceTimestamp: new Date('2021-03-05T10:11:12'),
      status: Status.UNKNOWN,
      changes: [
        {
          type: ChangeType.TRANSFER,
          amount: '100001',
          amountValue: new Wei('100001'),
          direction: Direction.EARN,
          wallet: '53c1fdb3-a2fd-4233-8e5c-b3ecc24486c4-1',
          asset: 'ETH',
        },
      ],
    };
    await state.txhistory.submit(tx1);
    await state.txhistory.submit(tx2);

    let filter: TxHistoryFilter = {
      wallet: '74b0a509-9083-4b12-80bb-e01db1fa2293',
    };
    let act = await state.txhistory.query(filter);
    expect(act.items.length).toBe(1);
    expect(act.items[0].txId).toBe(tx1.txId);
    expect(act.items[0].changes.length).toBe(1);
    expect(act.items[0].changes[0]).toEqual(tx1.changes[0]);

    filter = {
      wallet: '53c1fdb3-a2fd-4233-8e5c-b3ecc24486c4',
    };
    act = await state.txhistory.query(filter);
    expect(act.items.length).toBe(1);
    expect(act.items[0].txId).toBe(tx2.txId);

    filter = {
      wallet: '53c1fdb3-a2fd-4233-8e5c-b3ecc24486c4-1',
    };
    act = await state.txhistory.query(filter);
    expect(act.items.length).toBe(1);
    expect(act.items[0].txId).toBe(tx2.txId);

    filter = {
      wallet: '53c1fdb3-a2fd-4233-8e5c-b3ecc24486c4-2',
    };
    act = await state.txhistory.query(filter);
    expect(act.items.length).toBe(0);
  });

  test('empty cursor for a new address', async () => {
    const act = await state.txhistory.getCursor(
      'xpub661MyMwAqRbcGczjuMoRm6dXaLDEhW1u34gKenbeYqAix21mdUKJyuyu5F1rzYGVxyL6tmgBUAEPrEz92mBXjByMRiJdba9wpnN37RLLAXa',
    );
    expect(act).toBeNull();
  });

  test('updates cursor value', async () => {
    const xpub =
      'xpub661MyMwAqRbcGczjuMoRm6dXaLDEhW1u34gKenbeYqAix21mdUKJyuyu5F1rzYGVxyL6tmgBUAEPrEz92mBXjByMRiJdba9wpnN37RLLAXa';
    const act = await state.txhistory.getCursor(xpub);
    expect(act).toBeNull();

    await state.txhistory.setCursor(xpub, 'MDYwNmMzOTctNTBiNy00NjIzLThmOTktYmU5Y2VhMjk3NTc1');
    const act2 = await state.txhistory.getCursor(xpub);
    expect(act2).toBe('MDYwNmMzOTctNTBiNy00NjIzLThmOTktYmU5Y2VhMjk3NTc1');

    await state.txhistory.setCursor(xpub, 'NjgyNmY0YWUtOTE3MC00MDIyLTllMDEtNzBhZjZmMjIxYWUy');
    const act3 = await state.txhistory.getCursor(xpub);
    expect(act3).toBe('NjgyNmY0YWUtOTE3MC00MDIyLTllMDEtNzBhZjZmMjIxYWUy');
  });
});
