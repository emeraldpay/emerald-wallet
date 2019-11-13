import { Seed } from '@emeraldpay/emerald-vault-node';

export class LedgerApi {
  private conn: Seed;

  constructor () {
    this.conn = new Seed();
  }

  public isConnected (): boolean {
    return this.conn.isAvailable();
  }

  public getAddress (hdpath: string): Promise<string> {
    if (!this.isConnected()) {
      return Promise.reject(new Error('Not connected to Ledger'));
    }
    return new Promise((resolve, reject) => {
      const result = this.conn.listAddresses('ethereum', [hdpath]);
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
    return new Promise((resolve, reject) => {
      const result = this.conn.listAddresses('ethereum', dpaths);
      resolve(result);
    });
  }
}
