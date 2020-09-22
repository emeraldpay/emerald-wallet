import {BlockchainCode, blockchainCodeToId} from '../blockchains';
import {AddressBookItem} from "@emeraldpay/emerald-vault-core";
import {IEmeraldVault} from "@emeraldpay/emerald-vault-core/lib/vault";

export interface IAddressBookService {
  getItems: (blockchain: BlockchainCode) => Promise<AddressBookItem[]>;
  addNew: (item: AddressBookItem) => Promise<boolean>;
  remove: (blockchain: BlockchainCode, address: string) => Promise<boolean>;
}

export class AddressBookService implements IAddressBookService {
  private vault: IEmeraldVault;

  constructor(vault: IEmeraldVault) {
    this.vault = vault;
  }

  public getItems = (blockchain: BlockchainCode): Promise<AddressBookItem[]> => {
    return this.vault.listAddressBook(blockchainCodeToId(blockchain));
  }

  public addNew = (item: AddressBookItem): Promise<boolean> => {
    return this.vault.addToAddressBook(item);
  }

  public remove = (blockchain: BlockchainCode, address: string): Promise<boolean> => {
    return this.vault.removeFromAddressBook(blockchainCodeToId(blockchain), address);
  }
}
