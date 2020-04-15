import AddressBookItem from '../address-book/AddressBookItem';
import { BlockchainCode } from '../blockchains';
import Wallet from '../entities/Wallet';

export default interface IBackendApi {
  getAllWallets: () => Promise<Wallet[]>;
  createWallet: (name: string) => Promise<Wallet>;
  getWallet: (walletId: string) => Promise<Wallet>;

  // Address Book
  getAddressBookItems: (blockchain: BlockchainCode) => Promise<AddressBookItem[]>;
  addAddressBookItem: (item: AddressBookItem) => Promise<boolean>;
  removeAddressBookItem: (blockchain: BlockchainCode, address: string) => Promise<boolean>;

  // Transactions History
  persistTransactions: (blockchain: BlockchainCode, txs: any[]) => Promise<void>;

  // ETH chains
  getErc20Balance: (blockchain: BlockchainCode, tokenId: string, address: string) => Promise<string>;
  getGasPrice: (blockchain: BlockchainCode) => Promise<number>;

  // Accounts
  importEthereumJson: (
    blockchain: BlockchainCode, walletId: string, json: any) => Promise<any>;
  importRawPrivateKey: (
    blockchain: BlockchainCode, walletId: string, privateKey: string, password: string) => Promise<any>;

}
