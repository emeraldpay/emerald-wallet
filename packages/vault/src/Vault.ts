/*
Copyright 2020 EmeraldPay, Inc
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
import {
  AddressBookItem,
  BlockchainType,
  SeedDefinition,
  SeedReference,
  Uuid,
  Wallet
} from '@emeraldpay/emerald-vault-core';
import {BlockchainCode, ILogger, IVault, Logger, blockchainCodeToId} from '@emeraldwallet/core';

export class Vault implements IVault {

  public provider: vault.IEmeraldVault;
  private log: ILogger;

  constructor(provider: vault.IEmeraldVault) {
    this.provider = provider;
    this.log = Logger.forCategory('vault');
  }

  public getWallet (id: string): Wallet | undefined {
    const result = this.provider.getWallet(id);
    if (!result) {
      return undefined;
    }
    return result;
  }

  public listWallets (): Wallet[] {
    return this.provider.listWallets();
  }

  public addToAddressBook (item: AddressBookItem): boolean {
    return this.provider.addToAddressBook(item);
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
    return this.provider.listAddressBook(blockchainCodeToId(blockchain));
  }

  public removeFromAddressBook(blockchain: BlockchainCode, address: string): boolean {
    return this.provider.removeFromAddressBook(blockchainCodeToId(blockchain), address);
  }

  listSeeds(): vault.SeedDescription[] {
    return this.provider.listSeeds()
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

  public importSeed(seed: vault.SeedDefinition): string {
    return this.provider.importSeed(seed);
  }

  public getConnectedHWSeed(create: boolean): vault.SeedDescription | undefined {
    return this.provider.getConnectedHWSeed(create);
  }

  public isSeedAvailable(seed: Uuid | vault.SeedReference | vault.SeedDefinition): boolean {
    return this.provider.isSeedAvailable(seed);
  }

  public signTx(accountFullId: string, tx: vault.UnsignedTx, password?: string): string {
    return this.provider.signTx(accountFullId, tx, password);
  }

  public listSeedAddresses(id: Uuid | SeedReference | SeedDefinition, blockchain: BlockchainType, hdpath: string[]): { [key: string]: string } {
    return this.provider.listSeedAddresses(id, blockchain, hdpath)
  }

}
