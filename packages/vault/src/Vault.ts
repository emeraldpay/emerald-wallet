/*
Copyright 2019 ETCDEV GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as vault from '@emeraldpay/emerald-vault-core';
import { AddressBookItem, BlockchainCode, ILogger, IVault, Logger, Wallet } from '@emeraldwallet/core';
import { blockchainCodeToId, blockchainIdToCode } from './utils';

export class Vault implements IVault {

  public provider: vault.IEmeraldVault;
  private log: ILogger;

  constructor (provider: vault.IEmeraldVault) {
    this.provider = provider;
    this.log = Logger.forCategory('vault');
  }

  public getWallet (id: string): Wallet | undefined {
    const result = this.provider.getWallet(id);
    if (!result) {
      return undefined;
    }
    return this.mapToCore(result);
  }

  public listWallets (): Wallet[] {
    const result = this.provider.listWallets();
    // Map vault entities to out core entities
    return result.map((w) => this.mapToCore(w));
  }

  public addToAddressBook (item: AddressBookItem): boolean {
    return this.provider.addToAddressBook({
      address: item.address,
      blockchain: blockchainCodeToId(item.blockchain),
      description: item.description,
      name: item.name
    });
  }

  public addWalletWithSeed (seedId: string, label: string | undefined): string {
    return this.provider.addWallet({
      name: label,
      reserved: [{
        seedId,
        accountId: 0
      }]
    } as any);
  }

  public addWallet (label: string | undefined): string {
    return this.provider.addWallet(label);
  }

  public listAddressBook (blockchain: BlockchainCode): AddressBookItem[] {
    const items = this.provider.listAddressBook(blockchainCodeToId(blockchain));
    return items.map(
      (item) => {
        return new AddressBookItem(
          blockchainIdToCode(item.blockchain),
          item.address, item.name, item.description);
      });
  }

  public removeFromAddressBook (blockchain: BlockchainCode, address: string): boolean {
    return this.provider.removeFromAddressBook(blockchainCodeToId(blockchain), address);
  }

  public addEntry(walletId: string, account: vault.AddEntry): string {
    try {
      return this.provider.addEntry(walletId, account);
    } catch (error) {
      this.log.error(`Vault error ${error.name} : ${error.message}`);
      throw error;
    }
  }

  public exportJsonPrivateKey (accountFullId: string, password?: string): Promise<string> {
    return Promise.resolve(this.provider.exportJsonPk(accountFullId, password));
  }

  public exportRawPrivateKey (accountFullId: string, password: string): Promise<string> {
    return Promise.resolve(this.provider.exportRawPk(accountFullId, password));
  }

  public generateMnemonic (size: number): string {
    return this.provider.generateMnemonic(size);
  }

  public setWalletLabel (walletId: string, label: string): boolean {
    return this.provider.setWalletLabel(walletId, label);
  }

  public importSeed (seed: vault.SeedDefinition): string {
    return this.provider.importSeed(seed);
  }

  public getConnectedHWSeed (create: boolean): vault.SeedDescription | undefined {
    return this.provider.getConnectedHWSeed(create);
  }

  public signTx (accountFullId: string, tx: vault.UnsignedTx, password?: string): string {
    return this.provider.signTx(accountFullId, tx, password);
  }

  private mapToCore (w: vault.Wallet): Wallet {
    const newWallet = new Wallet(w.id);
    newWallet.name = w.name;
    newWallet.accounts = w.entries.map((a: any) => {
      return {
        blockchain: blockchainIdToCode(a.blockchain),
        id: a.id,
        address: a.address,
        seedId: (a.key as vault.SeedPKRef)?.seedId,
        hdPath: (a.key as vault.SeedPKRef)?.hdPath,
        isHardware: false
      };
    });
    const seeds = this.provider.listSeeds();
    newWallet.accounts
      .filter((acc) => typeof acc.seedId == 'string')
      .forEach((acc) => {
        acc["isHardware"] = seeds.find((seed) => seed.id == acc.seedId)?.type == "ledger";
      })
    if (w.reserved && w.reserved.length > 0) {
      newWallet.seedId = w.reserved[0].seedId;
      newWallet.hdAccount = w.reserved[0].accountId;
    }
    return newWallet;
  }
}
