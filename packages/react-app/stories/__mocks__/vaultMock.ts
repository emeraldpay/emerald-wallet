import {
  AddressBookItem,
  CurrentAddress,
  EntryId,
  ExportedWeb3Json,
  IEmeraldVault,
  IconDetails,
  IdSeedReference,
  LedgerDetails,
  OddPasswordItem,
  SeedDefinition,
  SeedDescription,
  SeedReference,
  SignedMessage,
  SignedTx,
  UnsignedTx,
  Uuid,
  Wallet,
  WatchEvent,
} from '@emeraldpay/emerald-vault-core';
import { AddressRole } from '@emeraldpay/emerald-vault-core/lib/types';

export const REAL_BTC_TX =
  '0200000000010109dc86940a177b31454881110398b265fef9c55a47e1017b9967408eb0afef8f010000001716001425c5c9' +
  'ae97b8831eaef8184276ff55d72f5f85effeffffff027747c61b0000000017a914a0b4508cca72bf294e3cbddd9606644ae1' +
  'fe6d3087006a18000000000017a91491acb73977a2bf1298686e61a72f62f4e94258a687024730440220438fb2c075aeeed1' +
  'd1a0ff49efcae7bc9aa922d97d4395de856d76c39ef5069a02205599f95b7e7eadc742c309100d4db42e33225f8766279502' +
  'd9f1068e8d517f2a012102e8e1d7659d6fbc0dbf653826937b09475ba6763c347138965bfebdb762a9b107f8ed0900';

interface SeedAddresses {
  [key: string]: string;
}

export class MemoryVault {
  entries: Record<EntryId, Array<CurrentAddress>> = {};
  passwords: Record<Uuid, string> = {};
  seedAddresses: Record<Uuid, Record<string, string>> = {};
  seeds: Uuid[] = [];

  addEntry(id: EntryId, address: CurrentAddress): void {
    const { [id]: addresses = [] } = this.entries;

    this.entries[id] = [...addresses, address];
  }

  addSeedAddress(seedId: Uuid, hdpath: string, address: string): void {
    if (this.seeds.indexOf(seedId) < 0) {
      this.seedAddresses[seedId] = {};
      this.seeds.push(seedId);
    }

    this.seedAddresses[seedId][hdpath] = address;
  }
  addSeedAddresses(seedId: Uuid, addresses: Array<[string, string]>): void {
    if (this.seeds.indexOf(seedId) < 0) {
      this.seedAddresses[seedId] = {};
      this.seeds.push(seedId);
    }

    addresses.forEach(([hdpath, address]) => {
      this.seedAddresses[seedId][hdpath] = address;
    })
  }

  setSeedPassword(seedId: Uuid, password: string): void {
    this.passwords[seedId] = password;

    this.addSeedAddress(seedId, "m/44'/15167'/8173'/68/164", '0x11');
  }
}

export class VaultMock implements IEmeraldVault {
  readonly vault: MemoryVault;

  constructor(vault: MemoryVault) {
    this.vault = vault;
  }

  addEntry(): Promise<EntryId> {
    return Promise.resolve('');
  }

  addWallet(): Promise<Uuid> {
    return Promise.resolve('');
  }

  changeGlobalKey(): Promise<boolean> {
    return Promise.resolve(false);
  }

  createGlobalKey(): Promise<boolean> {
    return Promise.resolve(false);
  }

  exportJsonPk(): Promise<ExportedWeb3Json> {
    return Promise.resolve({ json: '', password: '' });
  }

  exportRawPk(): Promise<string> {
    return Promise.resolve('');
  }

  extractMessageSigner(): Promise<string> {
    return Promise.resolve('');
  }

  generateMnemonic(): Promise<string> {
    return Promise.resolve('');
  }

  getConnectedHWDetails(): Promise<LedgerDetails[]> {
    return Promise.resolve([
      {
        type: 'ledger',
        connected: true,
        app: 'bitcoin',
      },
    ]);
  }

  getIcon(): Promise<ArrayBuffer | null> {
    return Promise.resolve(null);
  }

  getOddPasswordItems(): Promise<OddPasswordItem[]> {
    return Promise.resolve([]);
  }

  getWallet(): Promise<Wallet | undefined> {
    return Promise.resolve(undefined);
  }

  iconsList(): Promise<IconDetails[]> {
    return Promise.resolve([]);
  }

  importSeed(): Promise<Uuid> {
    return Promise.resolve('');
  }

  isGlobalKeySet(): Promise<boolean> {
    return Promise.resolve(true);
  }

  isSeedAvailable(): Promise<boolean> {
    return Promise.resolve(false);
  }

  listAddressBook(): Promise<AddressBookItem[]> {
    return Promise.resolve([]);
  }

  listEntryAddresses(id: EntryId, role: AddressRole): Promise<CurrentAddress[]> {
    const { [id]: addresses = [] } = this.vault.entries;

    return Promise.resolve(addresses.filter(({ role: addressRole }) => addressRole === role));
  }

  listSeedAddresses(
    seedId: Uuid | SeedReference | SeedDefinition,
    blockchain: number,
    hdpaths: string[],
  ): Promise<SeedAddresses> {
    if (typeof seedId == 'object') {
      if (seedId.type == 'id') {
        const seed: IdSeedReference = seedId;

        if (typeof this.vault.passwords[seed.value] == 'string') {
          const expectedPassword = this.vault.passwords[seed.value];

          console.log('Password', seed.value, expectedPassword, seed.password);

          if (expectedPassword !== seed.password) {
            console.log(`Password '${seed.password}' != '${expectedPassword}'`);

            return Promise.reject(new Error('Invalid password'));
          }
        }

        const seedData = this.vault.seedAddresses[seedId.value];

        if (!seedData) {
          return Promise.resolve({});
        }

        const result: SeedAddresses = {};

        hdpaths.forEach((hdpath) => {
          if (seedData[hdpath]) {
            result[hdpath] = seedData[hdpath];
          }
        });

        return Promise.resolve(result);
      }
    }

    console.log('Unsupported seed', seedId);

    return Promise.resolve({});
  }

  listSeeds(): Promise<SeedDescription[]> {
    return Promise.resolve([]);
  }

  listWallets(): Promise<Wallet[]> {
    return Promise.resolve([]);
  }

  removeEntry(): Promise<boolean> {
    return Promise.resolve(false);
  }

  removeFromAddressBook(): Promise<boolean> {
    return Promise.resolve(false);
  }

  removeWallet(): Promise<boolean> {
    return Promise.resolve(false);
  }

  setEntryLabel(): Promise<boolean> {
    return Promise.resolve(false);
  }

  setEntryReceiveDisabled(): Promise<boolean> {
    return Promise.resolve(false);
  }

  setIcon(): Promise<boolean> {
    return Promise.resolve(true);
  }

  setState(): Promise<void> {
    return Promise.resolve(undefined);
  }

  setWalletLabel(): Promise<boolean> {
    return Promise.resolve(false);
  }

  signMessage(): Promise<SignedMessage> {
    return Promise.resolve({
      address: '0x0',
      signature: '0x0',
      type: 'eip191',
    });
  }

  signTx(entryId: EntryId, tx: UnsignedTx, password?: string): Promise<SignedTx> {
    console.log('Sign', entryId, tx, password);

    if (entryId == 'f1fa1c12-5ac0-48f3-a76d-5bfb75be37b4-3') {
      return Promise.resolve({
        raw: REAL_BTC_TX,
        txid: '8d00cb652b9c4cf8b532964d789904388e322826d42a45bf848224dd99390bff',
      });
    }

    return Promise.resolve({
      raw: '',
      txid: '',
    });
  }

  snapshotCreate(): Promise<boolean> {
    return Promise.resolve(true);
  }

  snapshotRestore(sourceFile: string, password: string): Promise<boolean> {
    return Promise.resolve(password === 'password');
  }

  tryUpgradeOddItems(): Promise<Uuid[]> {
    return Promise.resolve([]);
  }

  updateSeed(): Promise<boolean> {
    return Promise.resolve(true);
  }

  vaultVersion(): string {
    return '';
  }

  verifyGlobalKey(password: string): Promise<boolean> {
    return Promise.resolve(password === 'password');
  }

  watch(): Promise<WatchEvent> {
    return Promise.resolve({
      devices: [
        {
          blockchains: [],
          id: '64c40e4b-b419-4792-a977-24015ea25876',
        },
      ],
      version: 1,
    });
  }
}
