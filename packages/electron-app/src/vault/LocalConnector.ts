import {EmeraldVaultNative} from '@emeraldpay/emerald-vault-native';
import {Logger} from '@emeraldwallet/core';
import {IEmeraldVault} from "@emeraldpay/emerald-vault-core/lib/vault";

const log = Logger.forCategory('LocalConnector');

export class LocalConnector {
  public dataDir: string;
  private readonly vault: IEmeraldVault;

  constructor(dataDir: string) {
    if (log) {
      log.info('Use Vault data dir: ' + dataDir);
    }
    this.dataDir = dataDir;
    const nativeVault = new EmeraldVaultNative({
      dir: this.dataDir
    });
    nativeVault.open();
    this.vault = nativeVault;
  }

  public getProvider(): IEmeraldVault {
    return this.vault;
  }

}
