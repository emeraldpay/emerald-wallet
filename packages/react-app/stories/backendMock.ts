import { EstimationMode } from '@emeraldpay/api';
import {
  AddEntry,
  AddressBookItem,
  AddressRole,
  CreateAddressBookItem,
  CurrentAddress,
  EntryId,
  IdSeedReference,
  IEmeraldVault,
  LedgerDetails,
  LedgerSeedReference,
  SeedDefinition,
  SeedDescription,
  SeedReference,
  UnsignedTx,
  Uuid,
  Wallet,
  WalletCreateOptions,
  WalletState,
} from "@emeraldpay/emerald-vault-core";
import { AnyCoinCode, BlockchainCode, IApi, IBackendApi, IStoredTransaction } from "@emeraldwallet/core";

export class MemoryVault {
  seeds: Uuid[] = [];
  passwords: Record<Uuid, string> = {};
  // seed id -> hdpath -> address
  seedAddresses: Record<Uuid, Record<string, string>> = {};

  setSeedPassword(seedId: Uuid, password: string) {
    this.passwords[seedId] = password;
    this.addSeedAddress(seedId, "m/44'/15167'/8173'/68/164", "0x11")
  }

  addSeedAddress(seedId: Uuid, hdpath: string, address: string) {
    if (this.seeds.indexOf(seedId) < 0) {
      this.seeds.push(seedId);
      this.seedAddresses[seedId] = {};
    }
    this.seedAddresses[seedId][hdpath] = address;
  }
}

export class BlockchainMock {
  // address -> coin -> balance
  balances: Record<string, Record<string, string>> = {};

  setBalance(address: string, coin: AnyCoinCode, balance: string) {
    if (typeof this.balances[address] == 'undefined') {
      this.balances[address] = {};
    }
    this.balances[address][coin] = balance;
  }
}

export const REAL_BTC_TX = "0200000000010109dc86940a177b31454881110398b265fef9c55a47e1017b9967408eb0afef8f010000001716001425c5c9ae97b8831eaef8184276ff55d72f5f85effeffffff027747c61b0000000017a914a0b4508cca72bf294e3cbddd9606644ae1fe6d3087006a18000000000017a91491acb73977a2bf1298686e61a72f62f4e94258a687024730440220438fb2c075aeeed1d1a0ff49efcae7bc9aa922d97d4395de856d76c39ef5069a02205599f95b7e7eadc742c309100d4db42e33225f8766279502d9f1068e8d517f2a012102e8e1d7659d6fbc0dbf653826937b09475ba6763c347138965bfebdb762a9b107f8ed0900";


export class VaultMock implements IEmeraldVault {

  readonly vault: MemoryVault;

  constructor(vault: MemoryVault) {
    this.vault = vault;
  }

  listSeedAddresses(seedId: Uuid | SeedReference | SeedDefinition, blockchain: number, hdpaths: string[]): Promise<{ [key: string]: string }> {
    console.log("list addresses", seedId);
    if (typeof seedId == "object") {
      if (seedId.type == "id") {
        const seed: IdSeedReference = seedId;
        if (typeof this.vault.passwords[seed.value] == 'string') {
          const expectedPassword = this.vault.passwords[seed.value];
          console.log("Password", seed.value, expectedPassword, seed.password);
          if (expectedPassword !== seed.password) {
            console.log(`Password '${seed.password}' != '${expectedPassword}'`);
            return Promise.reject(new Error("Invalid password"));
          }
        }

        const seedData = this.vault.seedAddresses[seedId.value];
        if (!seedData) {
          return Promise.resolve({});
        }
        const result = {}
        hdpaths.forEach((hdpath) => {
          if (seedData[hdpath]) {
            result[hdpath] = seedData[hdpath]
          }
        })
        return Promise.resolve(result);
      }
    }
    console.log("Unsupported seed", seedId)
    return Promise.resolve({});
  }

  exportJsonPk(entryId: EntryId, password?: string): Promise<string> {
    return Promise.resolve("");
  }

  exportRawPk(entryId: EntryId, password: string): Promise<string> {
    return Promise.resolve("");
  }

  listEntryAddresses(id: EntryId, role: AddressRole, start: number, limit: number): Promise<CurrentAddress[]> {
    return Promise.resolve([]);
  }

  removeEntry(entryId: EntryId): Promise<boolean> {
    return Promise.resolve(false);
  }

  removeWallet(walletId: Uuid): Promise<boolean> {
    return Promise.resolve(false);
  }

  setEntryLabel(entryFullId: EntryId, label: string | null): Promise<boolean> {
    return Promise.resolve(false);
  }

  setEntryReceiveDisabled(entryFullId: EntryId, disabled: boolean): Promise<boolean> {
    return Promise.resolve(false);
  }

  setState(state: WalletState): Promise<void> {
    return Promise.resolve(undefined);
  }

  vaultVersion(): string {
    return "";
  }

  addEntry(walletId: Uuid, entry: AddEntry): Promise<EntryId> {
    return Promise.resolve(undefined);
  }

  addToAddressBook(item: CreateAddressBookItem): Promise<boolean> {
    return Promise.resolve(false);
  }

  addWallet(labelOrOptions?: string | WalletCreateOptions | undefined): Promise<Uuid> {
    return Promise.resolve(undefined);
  }

  generateMnemonic(size: number): Promise<string> {
    return Promise.resolve("");
  }

  getConnectedHWSeed(create: boolean): Promise<SeedDescription | undefined> {
    return Promise.resolve(undefined);
  }

  getWallet(id: Uuid): Promise<Wallet | undefined> {
    return Promise.resolve(undefined);
  }

  importSeed(seed: SeedDefinition | LedgerSeedReference): Promise<Uuid> {
    return Promise.resolve(undefined);
  }

  isSeedAvailable(seed: Uuid | SeedReference | SeedDefinition): Promise<boolean> {
    return Promise.resolve(false);
  }

  listAddressBook(blockchain: number): Promise<AddressBookItem[]> {
    return Promise.resolve([]);
  }

  listSeeds(): Promise<SeedDescription[]> {
    return Promise.resolve([]);
  }

  listWallets(): Promise<Wallet[]> {
    return Promise.resolve([]);
  }

  removeFromAddressBook(blockchain: number, address: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  setWalletLabel(walletId: Uuid, label: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  signTx(entryId: EntryId, tx: UnsignedTx, password?: string): Promise<string> {
    console.log("Sign", entryId, tx, password);
    if (entryId == "f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3") {
      return Promise.resolve(REAL_BTC_TX)
    }
    return Promise.resolve("");
  }

  getConnectedHWDetails(): Promise<LedgerDetails[]> {
    return Promise.resolve([
      {
        type: "ledger",
        connected: true,
        app: "bitcoin"
      }
    ]);
  }

}

export class ApiMock implements IApi {

  readonly vault: IEmeraldVault;

  constructor(vault: IEmeraldVault) {
    this.vault = vault;
  }

  chain(name: BlockchainCode | string): any {
    return undefined;
  }

}

export class BackendMock implements IBackendApi {

  readonly vault: MemoryVault = new MemoryVault();
  readonly blockchains: Record<string, BlockchainMock> = {};

  broadcastSignedTx(blockchain: BlockchainCode, tx: any): Promise<string> {
    return Promise.resolve("");
  }

  estimateTxCost(blockchain: BlockchainCode, tx: any): Promise<number> {
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
          result[token] = "0";
        }
      } else {
        result[token] = "0";
      }
    })
    return Promise.resolve(result);
  }

  getGasPrice(blockchain: BlockchainCode): Promise<number> {
    return Promise.resolve(0);
  }

  persistTransactions(blockchain: BlockchainCode, txs: IStoredTransaction[]): Promise<void> {
    return Promise.resolve(undefined);
  }

  getNonce(blockchain: BlockchainCode, address: string): Promise<number> {
    return Promise.resolve(0)
  }

  useBlockchains(codes: string[]) {
    codes.forEach((code) => {
      this.blockchains[code.toLowerCase()] = new BlockchainMock()
    })
  }

  estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode) {
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
}
