import {AddressBookItem, AnyCoinCode, BlockchainCode, IBackendApi, Wallet} from "@emeraldwallet/core";
import {SeedDescription, Uuid} from "@emeraldpay/emerald-vault-core";

export class VaultMock {
  seeds: Uuid[] = [];
  // seed id -> hdpath -> address
  seedAddresses: Record<Uuid, Record<string, string>> = {};

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

export class BackendMock implements IBackendApi {

  readonly vault: VaultMock = new VaultMock();
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