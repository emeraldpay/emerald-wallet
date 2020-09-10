import {AnyCoinCode, BlockchainCode, IApi, IBackendApi, IVault} from "@emeraldwallet/core";
import {
  AddEntry,
  BlockchainType,
  EntryId, IdSeedReference, isReference,
  SeedDefinition,
  SeedDescription,
  SeedReference, UnsignedTx,
  Uuid,
  AddressBookItem,
  Wallet
} from "@emeraldpay/emerald-vault-core";

export class MemoryVault {
  seeds: Uuid[] = [];
  passwords: Record<Uuid, string> = {};
  // seed id -> hdpath -> address
  seedAddresses: Record<Uuid, Record<string, string>> = {};

  setSeedPassword(seedId: Uuid, password: string) {
    this.passwords[seedId] = password;
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

export class VaultMock implements IVault {

  readonly vault: MemoryVault;

  constructor(vault: MemoryVault) {
    this.vault = vault;
  }

  addEntry(walletId: Uuid, account: AddEntry): EntryId {
    return undefined;
  }

  addToAddressBook(item: AddressBookItem): boolean {
    return false;
  }

  addWallet(label: string | undefined): Uuid {
    return undefined;
  }

  addWalletWithSeed(seedId: string, label: string | undefined): Uuid {
    return undefined;
  }

  exportJsonPrivateKey(accountFullId: EntryId, password?: string): Promise<string> {
    return Promise.resolve("");
  }

  exportRawPrivateKey(accountFullId: EntryId, password: string): Promise<string> {
    return Promise.resolve("");
  }

  generateMnemonic(size: number): string {
    return "";
  }

  getConnectedHWSeed(create: boolean): SeedDescription | undefined {
    return undefined;
  }

  getWallet(id: Uuid): Wallet | undefined {
    return undefined;
  }

  importSeed(seed: SeedDefinition): Uuid {
    return undefined;
  }

  isSeedAvailable(seed: Uuid | SeedReference | SeedDefinition): boolean {
    return false;
  }

  listAddressBook(blockchain: BlockchainCode): AddressBookItem[] {
    return [];
  }

  listSeedAddresses(seedId: Uuid | SeedReference | SeedDefinition, blockchain: BlockchainType, hdpaths: string[]): { [key: string]: string } {
    console.log("list addresses");
    if (typeof seedId == "object") {
      if (seedId.type == "id") {
        const seed: IdSeedReference = seedId;
        if (typeof this.vault.passwords[seed.value] == 'string') {
          const expectedPassword = this.vault.passwords[seed.value];
          console.log("Password", seed.value, expectedPassword, seed.password);
          if (expectedPassword !== seed.password) {
            throw Error("Invalid password");
          }
        }

        const seedData = this.vault.seedAddresses[seedId.value];
        if (!seedData) {
          return {};
        }
        const result = {}
        hdpaths.forEach((hdpath) => {
          if (seedData[hdpath]) {
            result[hdpath] = seedData[hdpath]
          }
        })
        return result
      }
    }
    console.log("Unsupported seed", seedId)
    return {};
  }

  listSeeds(): SeedDescription[] {
    return [];
  }

  listWallets(): Wallet[] {
    return [];
  }

  removeFromAddressBook(blockchain: BlockchainCode, address: string): boolean {
    return false;
  }

  setWalletLabel(walletId: Uuid, label: string): boolean {
    return false;
  }

  signTx(accountFullId: EntryId, tx: UnsignedTx, password?: string): string {
    return "";
  }

}

export class ApiMock implements IApi {

  readonly vault: IVault;

  constructor(vault: IVault) {
    this.vault = vault;
  }

  chain(name: BlockchainCode | string): any {
    return undefined;
  }

}

export class BackendMock implements IBackendApi {

  readonly vault: MemoryVault = new MemoryVault();
  readonly blockchains: Record<string, BlockchainMock> = {};

  addAddressBookItem(item: AddressBookItem): Promise<boolean> {
    return Promise.resolve(false);
  }

  broadcastSignedTx(blockchain: BlockchainCode, tx: any): Promise<string> {
    return Promise.resolve("");
  }

  createHdAccount(walletId: string, blockchain: BlockchainCode, hdPath: string, password: string): Promise<string> {
    return Promise.resolve("");
  }

  createWallet(name: string, password: string, mnemonic: string): Promise<Wallet> {
    return Promise.resolve(undefined);
  }

  estimateTxCost(blockchain: BlockchainCode, tx: any): Promise<number> {
    return Promise.resolve(0);
  }

  exportJsonKeyFile(accountId: string): Promise<string> {
    return Promise.resolve("");
  }

  exportRawPrivateKey(accountId: string, password: string): Promise<string> {
    return Promise.resolve("");
  }

  getAddressBookItems(blockchain: BlockchainCode): Promise<AddressBookItem[]> {
    return Promise.resolve([]);
  }

  getAllWallets(): Promise<Wallet[]> {
    return Promise.resolve([]);
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

  getErc20Balance(blockchain: BlockchainCode, tokenId: string, address: string): Promise<string> {
    return Promise.resolve("");
  }

  getGasPrice(blockchain: BlockchainCode): Promise<number> {
    return Promise.resolve(0);
  }

  getWallet(walletId: string): Promise<Wallet> {
    return Promise.resolve(undefined);
  }

  importEthereumJson(blockchain: BlockchainCode, json: any): Promise<string> {
    return Promise.resolve("");
  }

  importRawPrivateKey(blockchain: BlockchainCode, privateKey: string, password: string): Promise<string> {
    return Promise.resolve("");
  }

  listSeeds(): Promise<SeedDescription[]> {
    return Promise.resolve([]);
  }

  persistTransactions(blockchain: BlockchainCode, txs: any[]): Promise<void> {
    return Promise.resolve(undefined);
  }

  removeAddressBookItem(blockchain: BlockchainCode, address: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  signTx(accountId: string, password: string, unsignedTx: any): Promise<any> {
    return Promise.resolve(undefined);
  }

  updateWallet(walletId: string, name: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  listSeedAddresses(seedId: Uuid, password: string, blockchain: BlockchainCode, hdpaths: string[]): Promise<Record<string, string>> {
    if (typeof this.vault.passwords[seedId] == 'string') {
      const expectedPassword = this.vault.passwords[seedId];
      console.log("Password", seedId, expectedPassword, password);
      if (expectedPassword != password) {
        return Promise.reject("Invalid password");
      }
    }
    const seed = this.vault.seedAddresses[seedId];
    if (!seed) {
      return Promise.resolve({});
    }
    const result = {}
    hdpaths.forEach((hdpath) => {
      if (seed[hdpath]) {
        result[hdpath] = seed[hdpath]
      }
    })
    return Promise.resolve(result);
  }

  useBlockchains(codes: string[]) {
    codes.forEach((code) => {
      this.blockchains[code.toLowerCase()] = new BlockchainMock()
    })
  }
}