import {BlockchainCode} from '../blockchains';
import {SeedDescription, Uuid, Wallet, AddressBookItem} from "@emeraldpay/emerald-vault-core";
import {AnyCoinCode} from "../Asset";

export default interface IBackendApi {
  /**
   * @deprecated use Vault
   */
  getAllWallets: () => Promise<Wallet[]>;
  /**
   * @deprecated use Vault
   */
  createWallet: (name: string, password: string, mnemonic: string) => Promise<Wallet>;
  /**
   * @deprecated use Vault
   */
  getWallet: (walletId: string) => Promise<Wallet>;
  /**
   * @deprecated use Vault
   */
  updateWallet: (walletId: string, name: string) => Promise<boolean>;
  /**
   * @deprecated use Vault
   */
  createHdAccount: (walletId: string, blockchain: BlockchainCode, hdPath: string, password: string) => Promise<string>;

  getBalance: (blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]) => Promise<Record<string, string>>;

  // Address Book
  /**
   * @deprecated use Vault
   */
  getAddressBookItems: (blockchain: BlockchainCode) => Promise<AddressBookItem[]>;
  /**
   * @deprecated use Vault
   */
  addAddressBookItem: (item: AddressBookItem) => Promise<boolean>;
  /**
   * @deprecated use Vault
   */
  removeAddressBookItem: (blockchain: BlockchainCode, address: string) => Promise<boolean>;

  // Transactions History
  persistTransactions: (blockchain: BlockchainCode, txs: any[]) => Promise<void>;

  // ETH chains

  /**
   * @deprecated use getBalance
   */
  getErc20Balance: (blockchain: BlockchainCode, tokenId: string, address: string) => Promise<string>;
  getGasPrice: (blockchain: BlockchainCode) => Promise<number>;

  broadcastSignedTx: (blockchain: BlockchainCode, tx: any) => Promise<string>;
  estimateTxCost: (blockchain: BlockchainCode, tx: any) => Promise<number>;

  // Accounts
  /**
   * @deprecated use Vault
   */
  importEthereumJson: (
    blockchain: BlockchainCode, json: any) => Promise<string>;
  /**
   * @deprecated use Vault
   */
  importRawPrivateKey: (
    blockchain: BlockchainCode, privateKey: string, password: string) => Promise<string>;

  /**
   * @deprecated use Vault
   */
  exportRawPrivateKey: (accountId: string, password: string) => Promise<string>;
  /**
   * @deprecated use Vault
   */
  exportJsonKeyFile: (accountId: string) => Promise<string>;


  /**
   * @deprecated use Vault
   */
  signTx: (accountId: string, password: string, unsignedTx: any) => Promise<any>;

  // Seeds
  /**
   * @deprecated use Vault
   */
  listSeeds: () => Promise<SeedDescription[]>;

  /**
   * @deprecated use Vault
   */
  listSeedAddresses(seedId: Uuid, password: string, blockchain: BlockchainCode, hdpath: string[]): Promise<Record<string, string>>;
}
