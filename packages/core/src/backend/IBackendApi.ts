import AddressBookItem from '../address-book/AddressBookItem';
import { BlockchainCode } from '../blockchains';
import Wallet from '../entities/Wallet';

export default interface IBackendApi {
  getAllWallets: () => Promise<Wallet[]>;

  // Address Book
  getAddressBookItems: (blockchain: BlockchainCode) => Promise<AddressBookItem[]>;
  addAddressBookItem: (item: AddressBookItem) => Promise<boolean>;
  removeAddressBookItem: (blockchain: BlockchainCode, address: string) => Promise<boolean>;

  // Transactions History

  // ERC20
  getErc20Balance: (blockchain: BlockchainCode, tokenId: string, address: string) => Promise<string>;
}
