import Account from './Account';

export default class Wallet {
  public id: string;
  public name?: string;
  public accounts: Account[];
  public seedId?: string;
  /**
   * BIP-44 account number
   */
  public hdAccount?: number;

  constructor (walletId: string, seedId?: string) {
    this.id = walletId;
    this.accounts = [];
    this.seedId = seedId;
  }
}
