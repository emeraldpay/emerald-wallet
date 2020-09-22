import { SeedDescription } from '@emeraldpay/emerald-vault-core';
import { EmeraldVaultNative } from '@emeraldpay/emerald-vault-native';

// @deprecated use vault
export class LedgerApi {
  private conn: EmeraldVaultNative;

  // @deprecated use vault
  constructor() {
    this.conn = new EmeraldVaultNative();
  }

  // @deprecated use vault
  public async isConnected(): Promise<boolean> {
    return (await this.conn.listSeeds())
      .filter((seed) => seed.type === 'ledger')
      .some((seed) => seed.available);
  }

  // @deprecated use vault
  public async getAddress(hdpath: string): Promise<string> {
    if (!(await this.isConnected())) {
      return Promise.reject(new Error('Not connected to Ledger'));
    }
    const seed = await this.getLedgerSeed();
    if (typeof seed === 'undefined') {
      return Promise.reject(new Error('No ledger available'));
    }
    const result = await this.conn.listSeedAddresses(seed!.id!, 100, [hdpath]);
    if (typeof result[hdpath] === 'string') {
      return result[hdpath]
    }
    throw new Error(`Failed to get address ${hdpath} from Ledger`)
  }

  // @deprecated use vault
  public async getAddresses(dpaths: string[]): Promise<any> {
    if (!(await this.isConnected())) {
      return Promise.reject(new Error('Not connected to Ledger'));
    }
    const seed = await this.getLedgerSeed();
    if (typeof seed === 'undefined') {
      return Promise.reject(new Error('No ledger available'));
    }
    const result = await this.conn.listSeedAddresses(seed!.id!, 100, dpaths);
    return result
  }

  // @deprecated use vault
  private async getLedgerSeed(): Promise<SeedDescription | undefined> {
    return (await this.conn.listSeeds())
      .find((seed) => seed.type === 'ledger');
  }
}
