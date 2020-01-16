import Account from './Account';

export default class Wallet {
  public name?: string;
  public accounts: Account[];

  constructor () {
    this.accounts = [];
  }
}
