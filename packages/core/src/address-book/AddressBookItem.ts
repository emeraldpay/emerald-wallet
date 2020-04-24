import { BlockchainCode } from '../blockchains';

export default class AddressBookItem {
  public address: string;
  public description?: string;
  public name?: string;
  public blockchain: BlockchainCode;

  constructor (blockchainCode: BlockchainCode, address: string, name?: string, description?: string) {
    this.blockchain = blockchainCode;
    this.address = address;
    this.description = description;
    this.name = name;
  }
}
