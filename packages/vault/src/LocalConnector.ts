import { EmeraldVaultNative } from '@emeraldpay/emerald-vault-native';
import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { DefaultLogger, ILogger } from '@emeraldwallet/core';
import { NativeVaultProvider } from './NativeProvider';
import { IVaultProvider } from './types';

export class LocalConnector {
  public dataDir: string;
  private vault: EmeraldVaultNative;

  constructor (dataDir: string, log?: ILogger) {
    if (log) {
      log.info("Use Vault data dir: " + dataDir)
    }
    this.dataDir = dataDir;
    this.vault = new EmeraldVaultNative({
      dir: this.dataDir
    });
    this.vault.autoMigrate()
  }

  public getProvider(): IEmeraldVault {
    return this.vault;
  }

}
