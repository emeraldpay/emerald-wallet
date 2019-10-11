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
import { EthAddress } from '@emeraldplatform/core';
import InMemoryProvider from './MemoryProvider';
import { Vault } from './vault';

describe('Vault with InMemoryProvider', () => {
  const newProvider = () => new InMemoryProvider();
  it('should create new account', () => {
    const vault = new Vault(newProvider());
    const chain = 'mainnet';

    return vault.newAccount('passPhrase', 'name1', 'desc', chain)
      .then((address) => {
        expect(EthAddress.fromHexString(address).isValid()).toBeTruthy();
      });
  });

  it('should not import mnemonic with empty passphrase', () => {
    const vault = new Vault(newProvider());
    const chain = 'mainnet';
    expect.assertions(1);
    return expect(vault.importMnemonic('', 'name1', 'desc', 'mnemonic', 'path', chain)).rejects.toBeDefined();
  });

  it('should list not hidden accounts', () => {
    const vault = new Vault(newProvider());
    const chain = 'mainnet';
    return vault.newAccount('passPhrase', 'name1', 'desc', chain)
      .then((address) => vault.listAccounts(chain).then((list) => {
        expect(list).toHaveLength(1);
        expect(list[0].address).toEqual(address);
        expect(list[0].name).toEqual('name1');
        expect(list[0].description).toEqual('desc');
        expect(list[0].hidden).toEqual(false);
      }));
  });

  it('should export key file', () => {
    const vault = new Vault(newProvider());
    const chain = 'mainnet';
    return vault.newAccount('passPhrase', 'name1', 'desc', chain)
      .then((address) => vault.exportAccount(address, chain)
        .then((keyFile) => {
          expect(keyFile.version).toEqual(3);
          expect(keyFile.address).toEqual(address.substring(2));
        }));
  });

});
