import Account from './entities/Account';
import Wallet from './entities/Wallet';
import { IVault } from './vault';

export default class WalletService {
  private vault: IVault;

  constructor (vault: IVault) {
    this.vault = vault;
  }

  public importMnemonic (words: string, passphrase: string) {
    return this.vault.importSeed({
      type: 'mnemonic',
      password: passphrase,
      value: words
    });
  }

  public getAllWallets = (): Wallet[] => {
    return this.vault.listWallets();
  }

  public createNewWallet = (name: string): Wallet => {
    const walletId = this.vault.addWallet(name);
    const wallet = this.vault.getWallet(walletId);
    return wallet!;
  }
}
