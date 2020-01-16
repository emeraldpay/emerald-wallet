import { EmeraldVaultNative } from '@emeraldpay/emerald-vault-native';
import { IVault, Logger } from '@emeraldwallet/core';
import { Vault } from './Vault';

const log = Logger.forCategory('LocalConnector');

export class LocalConnector {
  public dataDir: string;
  private readonly vault: IVault;

  constructor (dataDir: string) {
    if (log) {
      log.info('Use Vault data dir: ' + dataDir);
    }
    this.dataDir = dataDir;
    const nativeVault = new EmeraldVaultNative({
      dir: this.dataDir
    });
    nativeVault.autoMigrate();

    this.vault = new Vault(nativeVault);
  }

  public getProvider (): IVault {
    return this.vault;
  }

}
