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

  public getWallet = (walletId: any): Wallet | undefined => {
    return this.vault.getWallet(walletId);
  }

  public createNewWallet = (walletName: string, password?: string, mnemonic?: string): Wallet => {
    let walletId;
    if (mnemonic && password) {
      // 1. Import Mnemonic seed
      const seedId = this.vault.importSeed({
        type: 'mnemonic',
        value: {
          value: mnemonic
        },
        password
      });
      // 2. Create wallet with Seed
      walletId = this.vault.addWalletWithSeed(seedId, walletName);
    } else {
      walletId = this.vault.addWallet(walletName);
    }
    const wallet = this.vault.getWallet(walletId);
    return wallet!;
  }
}
