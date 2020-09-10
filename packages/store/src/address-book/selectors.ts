import * as _ from 'lodash';
import {Contacts, moduleName} from './types';
import {IState} from "../types";
import {BlockchainCode} from "@emeraldwallet/core";
import {AddressBookItem} from "@emeraldpay/emerald-vault-core/lib/types";

export function all(state: IState): AddressBookItem[] {
  const book = state[moduleName];
  const result: AddressBookItem[] = [];
  Object.keys(book.contacts)
    .map((code) => code as BlockchainCode)
    .forEach((code) => {
      let contacts = book.contacts[code] as Contacts;
      let items: AddressBookItem[] = Object.values(contacts);
      result.push(...items)
    })
  return result;
}
