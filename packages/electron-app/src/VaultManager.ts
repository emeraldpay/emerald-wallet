import { EmeraldVaultNative } from '@emeraldpay/emerald-vault-native';

export class VaultManager extends EmeraldVaultNative {
  constructor(dir?: string) {
    super({ dir });

    this.open();
  }
}
