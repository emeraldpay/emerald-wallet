import { BlockchainCode } from '../blockchains';

export default class Account {
  public id: string;
  public blockchain: BlockchainCode;

  constructor (id: string, blockchain: BlockchainCode) {
    this.id = id;
    this.blockchain = blockchain;
  }
}
