import Account from './Account';

export default class Wallet {
  public id: string;
  public name?: string;
  public description?: string;
  public accounts: Account[];

  constructor (walletId: string) {
    this.id = walletId;
    this.accounts = [];
  }
}
