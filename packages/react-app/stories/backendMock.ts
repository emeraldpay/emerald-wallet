import { EstimationMode } from '@emeraldpay/api';
import {
  AddressBookItem,
  CurrentAddress,
  EntryId,
  EntryIdOp,
  ExportedWeb3Json,
  IEmeraldVault,
  IdSeedReference,
  LedgerDetails,
  OddPasswordItem,
  SeedDefinition,
  SeedDescription,
  SeedReference,
  UnsignedTx,
  Uuid,
  Wallet,
} from '@emeraldpay/emerald-vault-core';
import {
  AnyCoinCode,
  BlockchainCode,
  EthereumRawReceipt,
  EthereumRawTransaction,
  IBackendApi,
  PersistentState,
  WalletApi,
} from '@emeraldwallet/core';

export class MemoryAddressBook {
  storage: Record<string, PersistentState.AddressbookItem> = {};

  async add(item: PersistentState.AddressbookItem): Promise<string> {
    const id = Math.random().toString(16).substring(7);

    this.storage[item.address.address] = { id, ...item };

    return Promise.resolve(id);
  }

  async remove(id: string): Promise<void> {
    this.storage = Object.values(this.storage)
      .filter((item) => item.id !== id)
      .reduce((carry, item) => ({ ...carry, [item.address.address]: item }), {});
  }

  async query(
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
}

interface MemoryTransaction {
  cursor: string;
  tx: PersistentState.Transaction;
}

export class MemoryTxHistory {
  transactions: Array<MemoryTransaction>;

  insertTransactions(transactions: PersistentState.Transaction[]): void {
    this.transactions = transactions.map<MemoryTransaction>((tx, index) => ({ tx, cursor: `cursor:${index}` }));
  }

  async loadTransactions(
    filter?: PersistentState.TxHistoryFilter,
    query?: PersistentState.PageQuery,
  ): Promise<PersistentState.PageResult<PersistentState.Transaction>> {
    const cursorIndex = query.cursor == null ? -1 : this.transactions.findIndex((tx) => tx.cursor === query.cursor);

    const filtered = this.transactions
      .slice(cursorIndex > -1 ? cursorIndex : 0)
      .filter(({ tx }) => tx.changes.some((change) => EntryIdOp.of(change.wallet).extractWalletId() === filter.wallet));

    const [lastItem] = filtered.slice(-1);
    const [lastTx] = this.transactions.slice(-1);

    return Promise.resolve({
      cursor: lastItem?.cursor === lastTx?.cursor ? undefined : lastItem?.cursor,
      items: filtered.map(({ tx }) => tx),
    });
  }
}

export class MemoryVault {
  passwords: Record<Uuid, string> = {};
  seedAddresses: Record<Uuid, Record<string, string>> = {};
  seeds: Uuid[] = [];

  setSeedPassword(seedId: Uuid, password: string): void {
    this.passwords[seedId] = password;

    this.addSeedAddress(seedId, "m/44'/15167'/8173'/68/164", '0x11');
  }

  addSeedAddress(seedId: Uuid, hdpath: string, address: string): void {
    if (this.seeds.indexOf(seedId) < 0) {
      this.seedAddresses[seedId] = {};
      this.seeds.push(seedId);
    }

    this.seedAddresses[seedId][hdpath] = address;
  }
}

export class MemoryXPubPos {
  storage: Record<string, number> = {};

  async get(xpub: string): Promise<number> {
    const { [xpub]: current } = this.storage;

    return Promise.resolve(current);
  }

  async setAtLeast(xpub: string, position: number): Promise<void> {
    const { [xpub]: current } = this.storage;

    if (position > current) {
      this.storage[xpub] = position;
    }
  }
}

export class BlockchainMock {
  balances: Record<string, Record<string, string>> = {};

  setBalance(address: string, coin: AnyCoinCode, balance: string): void {
    if (typeof this.balances[address] == 'undefined') {
      this.balances[address] = {};
    }

    this.balances[address][coin] = balance;
  }
}

export const REAL_BTC_TX =
  '0200000000010109dc86940a177b31454881110398b265fef9c55a47e1017b9967408eb0afef8f010000001716001425c5c9' +
  'ae97b8831eaef8184276ff55d72f5f85effeffffff027747c61b0000000017a914a0b4508cca72bf294e3cbddd9606644ae1' +
  'fe6d3087006a18000000000017a91491acb73977a2bf1298686e61a72f62f4e94258a687024730440220438fb2c075aeeed1' +
  'd1a0ff49efcae7bc9aa922d97d4395de856d76c39ef5069a02205599f95b7e7eadc742c309100d4db42e33225f8766279502' +
  'd9f1068e8d517f2a012102e8e1d7659d6fbc0dbf653826937b09475ba6763c347138965bfebdb762a9b107f8ed0900';

export class AddressBookMock implements PersistentState.Addressbook {
  readonly addressBook: MemoryAddressBook;

  constructor(addressBook: MemoryAddressBook) {
    this.addressBook = addressBook;
  }

  add(item: PersistentState.AddressbookItem): Promise<string> {
    return this.addressBook.add(item);
  }

  async remove(id: string): Promise<void> {
    await this.addressBook.remove(id);
  }

  query(
    filter?: PersistentState.AddressbookFilter,
  ): Promise<PersistentState.PageResult<PersistentState.AddressbookItem>> {
    return this.addressBook.query(filter);
  }
}

export class TxHistoryMock implements PersistentState.TxHistory {
  readonly txHistory: MemoryTxHistory;

  constructor(txHistory: MemoryTxHistory) {
    this.txHistory = txHistory;
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

  submit(): Promise<PersistentState.Transaction> {
    throw new Error('Method not implemented.');
  }

  getCursor(): Promise<string | null> {
    throw new Error('Method not implemented.');
  }

  setCursor(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export class VaultMock implements IEmeraldVault {
  readonly vault: MemoryVault;

  constructor(vault: MemoryVault) {
    this.vault = vault;
  }

  listSeedAddresses(
    seedId: Uuid | SeedReference | SeedDefinition,
    blockchain: number,
    hdpaths: string[],
  ): Promise<{ [key: string]: string }> {
    console.log('list addresses', seedId);

    if (typeof seedId == 'object') {
      if (seedId.type == 'id') {
        const seed: IdSeedReference = seedId;

        if (typeof this.vault.passwords[seed.value] == 'string') {
          const expectedPassword = this.vault.passwords[seed.value];

          console.log('Password', seed.value, expectedPassword, seed.password);

          if (expectedPassword !== seed.password) {
            console.log(`Password '${seed.password}' != '${expectedPassword}'`);

            return Promise.reject(new Error('Invalid password'));
          }
        }

        const seedData = this.vault.seedAddresses[seedId.value];

        if (!seedData) {
          return Promise.resolve({});
        }

        const result = {};

        hdpaths.forEach((hdpath) => {
          if (seedData[hdpath]) {
            result[hdpath] = seedData[hdpath];
          }
        });

        return Promise.resolve(result);
      }
    }

    console.log('Unsupported seed', seedId);

    return Promise.resolve({});
  }

  exportJsonPk(): Promise<ExportedWeb3Json> {
    return Promise.resolve({ json: '', password: '' });
  }

  exportRawPk(): Promise<string> {
    return Promise.resolve('');
  }

  listEntryAddresses(): Promise<CurrentAddress[]> {
    return Promise.resolve([]);
  }

  removeEntry(): Promise<boolean> {
    return Promise.resolve(false);
  }

  removeWallet(): Promise<boolean> {
    return Promise.resolve(false);
  }

  setEntryLabel(): Promise<boolean> {
    return Promise.resolve(false);
  }

  setEntryReceiveDisabled(): Promise<boolean> {
    return Promise.resolve(false);
  }

  setState(): Promise<void> {
    return Promise.resolve(undefined);
  }

  vaultVersion(): string {
    return '';
  }

  addEntry(): Promise<EntryId> {
    return Promise.resolve(undefined);
  }

  addToAddressBook(): Promise<boolean> {
    return Promise.resolve(false);
  }

  addWallet(): Promise<Uuid> {
    return Promise.resolve(undefined);
  }

  generateMnemonic(): Promise<string> {
    return Promise.resolve('');
  }

  getConnectedHWSeed(): Promise<SeedDescription | undefined> {
    return Promise.resolve(undefined);
  }

  getWallet(): Promise<Wallet | undefined> {
    return Promise.resolve(undefined);
  }

  importSeed(): Promise<Uuid> {
    return Promise.resolve(undefined);
  }

  isSeedAvailable(): Promise<boolean> {
    return Promise.resolve(false);
  }

  listAddressBook(): Promise<AddressBookItem[]> {
    return Promise.resolve([]);
  }

  listSeeds(): Promise<SeedDescription[]> {
    return Promise.resolve([]);
  }

  listWallets(): Promise<Wallet[]> {
    return Promise.resolve([]);
  }

  removeFromAddressBook(): Promise<boolean> {
    return Promise.resolve(false);
  }

  setWalletLabel(): Promise<boolean> {
    return Promise.resolve(false);
  }

  signTx(entryId: EntryId, tx: UnsignedTx, password?: string): Promise<string> {
    console.log('Sign', entryId, tx, password);

    if (entryId == 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3') {
      return Promise.resolve(REAL_BTC_TX);
    }

    return Promise.resolve('');
  }

  getConnectedHWDetails(): Promise<LedgerDetails[]> {
    return Promise.resolve([
      {
        type: 'ledger',
        connected: true,
        app: 'bitcoin',
      },
    ]);
  }

  createGlobalKey(): Promise<boolean> {
    return Promise.resolve(false);
  }

  changeGlobalKey(): Promise<boolean> {
    return Promise.resolve(false);
  }

  getOddPasswordItems(): Promise<OddPasswordItem[]> {
    return Promise.resolve([]);
  }

  isGlobalKeySet(): Promise<boolean> {
    return Promise.resolve(true);
  }

  tryUpgradeOddItems(): Promise<Uuid[]> {
    return Promise.resolve([]);
  }

  verifyGlobalKey(password: string): Promise<boolean> {
    return Promise.resolve(password === 'password');
  }

  snapshotCreate(): Promise<boolean> {
    return Promise.resolve(true);
  }

  snapshotRestore(sourceFile: string, password: string): Promise<boolean> {
    return Promise.resolve(password === 'password');
  }
}

export class XPubPosMock implements PersistentState.XPubPosition {
  readonly xPubPos: MemoryXPubPos;

  constructor(xPubPos: MemoryXPubPos) {
    this.xPubPos = xPubPos;
  }

  get(xpub: string): Promise<number> {
    return this.xPubPos.get(xpub);
  }

  setAtLeast(xpub: string, pos: number): Promise<void> {
    return this.xPubPos.setAtLeast(xpub, pos);
  }
}

export class ApiMock implements WalletApi {
  readonly addressBook: PersistentState.Addressbook;
  readonly txHistory: PersistentState.TxHistory;
  readonly vault: IEmeraldVault;
  readonly xPubPos: PersistentState.XPubPosition;

  constructor(
    addressBook: PersistentState.Addressbook,
    txHistory: PersistentState.TxHistory,
    vault: IEmeraldVault,
    xPubPos: PersistentState.XPubPosition,
  ) {
    this.addressBook = addressBook;
    this.txHistory = txHistory;
    this.vault = vault;
    this.xPubPos = xPubPos;
  }

  chain(): unknown {
    return undefined;
  }
}

export class BackendMock implements IBackendApi {
  readonly addressBook = new MemoryAddressBook();
  readonly blockchains: Record<string, BlockchainMock> = {};
  readonly txHistory = new MemoryTxHistory();
  readonly vault = new MemoryVault();
  readonly xPubPos = new MemoryXPubPos();

  broadcastSignedTx(): Promise<string> {
    return Promise.resolve('');
  }

  estimateTxCost(): Promise<number> {
    return Promise.resolve(0);
  }

  getBalance(blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]): Promise<Record<string, string>> {
    const state = this.blockchains[blockchain.toLowerCase()];

    if (typeof state == 'undefined') {
      return Promise.resolve({});
    }

    const result: { [key: string]: string } = {};

    tokens.forEach((token) => {
      if (state.balances[address]) {
        const balance = state.balances[address][token];

        if (balance) {
          result[token] = balance;
        } else {
          result[token] = '0';
        }
      } else {
        result[token] = '0';
      }
    });
    return Promise.resolve(result);
  }

  getGasPrice(): Promise<number> {
    return Promise.resolve(0);
  }

  getNonce(): Promise<number> {
    return Promise.resolve(0);
  }

  useBlockchains(codes: string[]): void {
    codes.forEach((code) => {
      this.blockchains[code.toLowerCase()] = new BlockchainMock();
    });
  }

  estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode): Promise<number> {
    switch (mode) {
      case 'avgLast':
        return Promise.resolve(1000);
      case 'avgMiddle':
        return Promise.resolve(3000);
      case 'avgTail5':
        return Promise.resolve(1500);
    }

    return Promise.resolve(0);
  }

  getEthReceipt(): Promise<EthereumRawReceipt | null> {
    return Promise.resolve(null);
  }

  getEthTx(): Promise<EthereumRawTransaction | null> {
    return Promise.resolve(null);
  }
}
