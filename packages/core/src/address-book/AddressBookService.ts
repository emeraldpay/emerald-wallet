import { BlockchainCode } from '../blockchains';
import { IVault } from '../vault';
import AddressBookItem from './AddressBookItem';

export interface IAddressBookService {
  getItems: (blockchain: BlockchainCode) => AddressBookItem[];
  addNew: (item: AddressBookItem) => boolean;
  remove: (blockchain: BlockchainCode, address: string) => boolean;
}

export class AddressBookService implements IAddressBookService {
  private vault: IVault;
  constructor (vault: IVault) {
    this.vault = vault;
  }

  public getItems = (blockchain: BlockchainCode): AddressBookItem[] => {
    return this.vault.listAddressBook(blockchain);
  }

  public addNew = (item: AddressBookItem): boolean => {
    return this.vault.addToAddressBook(item);
  }

  public remove = (blockchain: BlockchainCode, address: string): boolean => {
    return this.vault.removeFromAddressBook(blockchain, address);
  }
}
