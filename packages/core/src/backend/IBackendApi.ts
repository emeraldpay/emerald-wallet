import AddressBookItem from '../address-book/AddressBookItem';
import {BlockchainCode} from '../blockchains';
import Wallet from '../entities/Wallet';
import {SeedDescription, Uuid} from "@emeraldpay/emerald-vault-core";
import {AnyCoinCode} from "../Asset";

export default interface IBackendApi {
  getAllWallets: () => Promise<Wallet[]>;
  createWallet: (name: string, password: string, mnemonic: string) => Promise<Wallet>;
  getWallet: (walletId: string) => Promise<Wallet>;
  updateWallet: (walletId: string, name: string) => Promise<boolean>;
  createHdAccount: (walletId: string, blockchain: BlockchainCode, hdPath: string, password: string) => Promise<string>;

  getBalance: (blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]) => Promise<Record<string, string>>;

  // Address Book
  getAddressBookItems: (blockchain: BlockchainCode) => Promise<AddressBookItem[]>;
  addAddressBookItem: (item: AddressBookItem) => Promise<boolean>;
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
  importEthereumJson: (
    blockchain: BlockchainCode, json: any) => Promise<string>;
  importRawPrivateKey: (
    blockchain: BlockchainCode, privateKey: string, password: string) => Promise<string>;

  exportRawPrivateKey: (accountId: string, password: string) => Promise<string>;
  exportJsonKeyFile: (accountId: string) => Promise<string>;


  signTx: (accountId: string, password: string, unsignedTx: any) => Promise<any>;

  // Seeds
  listSeeds: () => Promise<SeedDescription[]>;

  listSeedAddresses(seedId: Uuid, password: string, blockchain: BlockchainCode, hdpath: string[]): Promise<Record<string, string>>;
}
