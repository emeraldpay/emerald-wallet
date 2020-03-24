import { SeedDescription } from '@emeraldpay/emerald-vault-core';
import { EmeraldVaultNative } from '@emeraldpay/emerald-vault-native';

export class LedgerApi {
  private conn: EmeraldVaultNative;

  constructor () {
    this.conn = new EmeraldVaultNative();
  }

  public isConnected (): boolean {
    return this.conn.listSeeds()
      .filter((seed) => seed.type === 'ledger')
      .some((seed) => seed.available);
  }

  public getAddress (hdpath: string): Promise<string> {
    if (!this.isConnected()) {
      return Promise.reject(new Error('Not connected to Ledger'));
    }
    const seed = this.getLedgerSeed();
    if (typeof seed === 'undefined') {
      return Promise.reject(new Error('No ledger available'));
    }
    return new Promise((resolve, reject) => {
      const result = this.conn.listSeedAddresses(seed!.id!, 'ethereum', [hdpath]);
      if (typeof result[hdpath] === 'string') {
        resolve(result[hdpath]);
      } else {
        reject(new Error(`Failed to get address ${hdpath} from Ledger`));
      }
    });
  }

  public getAddresses (dpaths: string[]): Promise<any> {
    if (!this.isConnected()) {
      return Promise.reject(new Error('Not connected to Ledger'));
    }
    const seed = this.getLedgerSeed();
    if (typeof seed === 'undefined') {
      return Promise.reject(new Error('No ledger available'));
    }
    return new Promise((resolve, reject) => {
      const result = this.conn.listSeedAddresses(seed!.id!, 'ethereum', dpaths);
      resolve(result);
    });
  }

  private getLedgerSeed (): SeedDescription | undefined {
    return this.conn.listSeeds()
      .find((seed) => seed.type === 'ledger');
  }
}
