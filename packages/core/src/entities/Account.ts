import { BlockchainCode } from '../blockchains';

export default class Account {
  public id: string;
  public blockchain: BlockchainCode;
  public address?: string;

  constructor (id: string, blockchain: BlockchainCode) {
    this.id = id;
    this.blockchain = blockchain;
  }
}
