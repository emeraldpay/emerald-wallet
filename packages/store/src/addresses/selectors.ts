import {Address, AddressList, AddressMap, moduleName} from "./types";
import {List, Map} from "immutable";
import {BlockchainCode} from "@emeraldwallet/core";
import {Wei} from "@emeraldplatform/eth";

export function all(state: any): AddressList {
  return state[moduleName].get('addresses');
}

export const isLoading = (state: any): boolean => state[moduleName].get('loading');

export function find(state: any, address: string, chain: string): AddressMap | undefined {
  if (!address) {
    return undefined;
  }
  return all(state).find((a: any) => a.get('id') === address && a.get('blockchain') === chain);
}

export function findAllChains(state: any, address: string): AddressList {
  if (!address) {
    return List.of();
  }
  return all(state).filter((a: any) => a.get('id') === address.toLowerCase()).toList();
}

export function balanceByChain(state: any, chain: BlockchainCode): Wei {
  return all(state)
    .filter((a: any) => a.get('blockchain').toLowerCase() === chain.toLowerCase())
    .map((a: any) => (a.get('balance') ? a.get('balance') : Wei.ZERO))
    .reduce((r: Wei | undefined, val: Wei | undefined) => r!.plus(val!), Wei.ZERO)
      || Wei.ZERO
}
