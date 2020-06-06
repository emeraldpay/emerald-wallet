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
declare module 'ethereumjs-wallet' {
  class Wallet {
    public static fromPrivateKey (key: Buffer): Wallet;
    public static fromV3 (json: string, password: string): Wallet;
    public getPrivateKey (): Buffer;
    public getPrivateKeyString (): string;
    public getAddressString (): string;
    public toV3String (password: string, opts?: any): string;
  }

  namespace Wallet {}

  export = Wallet;
}

declare module 'ethereumjs-wallet/hdkey' {

  class Wallet {
    public static fromPrivateKey (key: Buffer): Wallet;
    public static fromV3 (json: string, password: string): Wallet;
    public getPrivateKey (): Buffer;
    public getAddressString (): string;
  }

  class EthereumHDKey {
    public privateExtendedKey (): string;
    public publicExtendedKey (): string;
    public derivePath (path: string): EthereumHDKey;
    public deriveChild (index: number): EthereumHDKey;
    public getWallet (): Wallet;
  }

  export function fromMasterSeed (seed: Buffer): EthereumHDKey;
  export function fromExtendedKey (base58key: string): EthereumHDKey;
}
