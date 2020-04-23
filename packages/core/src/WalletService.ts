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

  public createNewWallet = (name: string, mnemonic: string): Wallet => {
    // 1. Import Mnemonic seed
    const seedId = this.vault.importSeed({
      type: 'mnemonic',
      value: {
        value: mnemonic
      }
    });
    // 2. Create wallet with Seed
    const walletId = this.vault.addWallet(seedId, name);
    const wallet = this.vault.getWallet(walletId);
    return wallet!;
  }
}
