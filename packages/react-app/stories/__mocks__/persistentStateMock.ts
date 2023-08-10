import { EntryIdOp, Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, PersistentState, blockchainCodeToId } from '@emeraldwallet/core';

export class MemoryAddressBook {
  storage: Record<string, PersistentState.AddressbookItem> = {};

  add(item: PersistentState.AddressbookItem): Promise<string> {
    const id = Math.random().toString(16).substring(7);

    this.storage[id] = { id, ...item };

    return Promise.resolve(id);
  }

  get(id: string): Promise<PersistentState.AddressbookItem> {
    return Promise.resolve(this.storage[id]);
  }

  async remove(id: string): Promise<void> {
    this.storage = Object.values(this.storage)
      .filter((item) => item.id !== id)
      .reduce((carry, item) => ({ ...carry, [item.address.address]: item }), {});
  }

  query(
    filter?: PersistentState.AddressbookFilter,
  ): Promise<PersistentState.PageResult<PersistentState.AddressbookItem>> {
    let items = Object.values(this.storage);

    if (filter != null) {
      items = items.filter((item) => item.blockchain === filter.blockchain);
    }

    return Promise.resolve({
      items,
      cursor: '0',
    });
  }

  update(id: string, item: Partial<PersistentState.AddressbookItem>): Promise<boolean> {
    if (this.storage[id] == null) {
      return Promise.resolve(false);
    }

    this.storage[id] = {
      ...this.storage[id],
      ...item,
    };

    return Promise.resolve(true);
  }
}

export class MemoryAllowances {
  private allowances = new Map<Uuid, PersistentState.CachedAllowance[]>();

  list(walletId?: Uuid): Promise<PersistentState.PageResult<PersistentState.CachedAllowance>> {
    let items: PersistentState.CachedAllowance[];

    if (walletId == null) {
      items = [...this.allowances.values()].flat();
    } else {
      items = this.allowances.get(walletId) ?? [];
    }

    return Promise.resolve({
      items,
      cursor: '0',
    });
  }

  set(walletId: Uuid, allowance: PersistentState.CachedAllowance, ttl?: number): Promise<void> {
    const allowances = this.allowances.get(walletId) ?? [];

    setTimeout(() => this.allowances.set(walletId, [...allowances, allowance]), ttl);

    return Promise.resolve();
  }
}

export class MemoryBalances {
  private balances = new Map<PersistentState.Address | PersistentState.XPub, PersistentState.Balance[]>();

  list(address: PersistentState.Address | PersistentState.XPub): PersistentState.Balance[] {
    return this.balances.get(address) ?? [];
  }

  set(balance: PersistentState.Balance): boolean {
    const balances = this.balances.get(balance.address) ?? [];

    this.balances.set(balance.address, [...balances, balance]);

    return true;
  }
}

export class MemoryCache {
  private storage = new Map<string, string>();

  delete(key: string): void {
    this.storage.delete(key);
  }

  get(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  set(key: string, value: string, ttl?: number): void {
    this.storage.set(key, value);

    setTimeout(() => this.delete(key), (ttl ?? 0) * 1000);
  }
}

interface MemoryTransaction {
  cursor: string;
  tx: PersistentState.Transaction;
}

export class MemoryTxHistory {
  transactions: Array<MemoryTransaction> = [];

  insertTransactions(transactions: PersistentState.Transaction[]): void {
    this.transactions = transactions.map<MemoryTransaction>((tx, index) => ({ tx, cursor: `cursor:${index}` }));
  }

  async loadTransactions(
    filter?: PersistentState.TxHistoryFilter,
    query?: PersistentState.PageQuery,
  ): Promise<PersistentState.PageResult<PersistentState.Transaction>> {
    const cursorIndex = query?.cursor == null ? -1 : this.transactions.findIndex((tx) => tx.cursor === query.cursor);

    const filtered = this.transactions
      .slice(cursorIndex > -1 ? cursorIndex : 0)
      .filter(({ tx }) =>
        tx.changes.some(
          (change) => change.wallet != null && EntryIdOp.of(change.wallet).extractWalletId() === filter?.wallet,
        ),
      );

    const [lastItem] = filtered.slice(-1);
    const [lastTx] = this.transactions.slice(-1);

    return Promise.resolve({
      cursor: lastItem?.cursor === lastTx?.cursor ? undefined : lastItem?.cursor,
      items: filtered.map(({ tx }) => tx),
    });
  }
}

export class MemoryTxMeta {
  store: Record<number, Record<string, PersistentState.TxMetaItem | null>> = {};

  async getMeta(blockchain: BlockchainCode, txId: string): Promise<PersistentState.TxMetaItem | null> {
    return this.store[blockchainCodeToId(blockchain)]?.[txId] ?? null;
  }

  async setMeta(meta: PersistentState.TxMetaItem): Promise<PersistentState.TxMetaItem> {
    const blockchain = blockchainCodeToId(meta.blockchain);

    if (this.store[blockchain] == null) {
      this.store[blockchain] = {};
    }

    this.store[blockchain][meta.txId] = meta;

    return meta;
  }
}

export class MemoryXPubPos {
  storage: Record<string, number> = {};

  async getNext(xpub: string): Promise<number> {
    const { [xpub]: current } = this.storage;
    if (typeof current == 'undefined' || current == null) {
      return Promise.resolve(0);
    }
    return Promise.resolve(current + 1);
  }

  async setNextAddressAtLeast(xpub: string, position: number): Promise<void> {
    const { [xpub]: current } = this.storage;

    if (position > current) {
      this.storage[xpub] = position - 1;
    }
  }

  async setCurrentAddressAt(xpub: string, position: number): Promise<void> {
    const { [xpub]: current } = this.storage;

    if (position > current) {
      this.storage[xpub] = position;
    }
  }
}

export class AddressBookMock implements PersistentState.Addressbook {
  readonly addressBook: MemoryAddressBook;

  constructor(addressBook: MemoryAddressBook) {
    this.addressBook = addressBook;
  }

  add(item: PersistentState.AddressbookItem): Promise<string> {
    return this.addressBook.add(item);
  }

  get(id: string): Promise<PersistentState.AddressbookItem> {
    return this.addressBook.get(id);
  }

  query(
    filter?: PersistentState.AddressbookFilter,
  ): Promise<PersistentState.PageResult<PersistentState.AddressbookItem>> {
    return this.addressBook.query(filter);
  }

  async remove(id: string): Promise<void> {
    await this.addressBook.remove(id);
  }

  update(id: string, item: Partial<PersistentState.AddressbookItem>): Promise<boolean> {
    return this.addressBook.update(id, item);
  }
}

export class AllowancesMock implements PersistentState.Allowances {
  readonly allowances: MemoryAllowances;

  constructor(allowances: MemoryAllowances) {
    this.allowances = allowances;
  }

  add(walletId: Uuid, allowance: PersistentState.CachedAllowance, ttl?: number): Promise<void> {
    return this.allowances.set(walletId, allowance, ttl);
  }

  list(walletId?: Uuid): Promise<PersistentState.PageResult<PersistentState.CachedAllowance>> {
    return this.allowances.list(walletId);
  }
}

export class BalancesMock implements PersistentState.Balances {
  readonly balances: MemoryBalances;

  constructor(balances: MemoryBalances) {
    this.balances = balances;
  }

  list(address: PersistentState.Address | PersistentState.XPub): Promise<PersistentState.Balance[]> {
    return Promise.resolve(this.balances.list(address));
  }

  set(balance: PersistentState.Balance): Promise<boolean> {
    return Promise.resolve(this.balances.set(balance));
  }
}

export class CacheMock implements PersistentState.Cache {
  readonly cache: MemoryCache;

  constructor(cache: MemoryCache) {
    this.cache = cache;
  }

  async evict(id: string): Promise<void> {
    this.cache.delete(id);
  }

  get(id: string): Promise<string | null> {
    return Promise.resolve(this.cache.get(id));
  }

  async put(id: string, value: string, ttl?: number): Promise<void> {
    this.cache.set(id, value, ttl);
  }
}

export class TxHistoryMock implements PersistentState.TxHistory {
  readonly txHistory: MemoryTxHistory;

  constructor(txHistory: MemoryTxHistory) {
    this.txHistory = txHistory;
  }

  getCursor(): Promise<string | null> {
    throw new Error('Method not implemented.');
  }

  query(
    filter?: PersistentState.TxHistoryFilter,
    query?: PersistentState.PageQuery,
  ): Promise<PersistentState.PageResult<PersistentState.Transaction>> {
    return this.txHistory.loadTransactions(filter, query);
  }

  remove(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  setCursor(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  submit(): Promise<PersistentState.Transaction> {
    throw new Error('Method not implemented.');
  }
}

export class TxMetaMock implements PersistentState.TxMeta {
  readonly txMeta: MemoryTxMeta;

  constructor(txMeta: MemoryTxMeta) {
    this.txMeta = txMeta;
  }

  get(blockchain: BlockchainCode, txid: string): Promise<PersistentState.TxMetaItem | null> {
    return this.txMeta.getMeta(blockchain, txid);
  }

  set(meta: PersistentState.TxMetaItem): Promise<PersistentState.TxMetaItem> {
    return this.txMeta.setMeta(meta);
  }
}

export class XPubPosMock implements PersistentState.XPubPosition {
  readonly xPubPos: MemoryXPubPos;

  constructor(xPubPos: MemoryXPubPos) {
    this.xPubPos = xPubPos;
  }

  getNext(xpub: string): Promise<number> {
    return this.xPubPos.getNext(xpub);
  }

  setCurrentAddressAt(xpub: string, pos: number): Promise<void> {
    return this.xPubPos.setCurrentAddressAt(xpub, pos);
  }

  setNextAddressAtLeast(xpub: string, pos: number): Promise<void> {
    return this.xPubPos.setNextAddressAtLeast(xpub, pos);
  }
}
