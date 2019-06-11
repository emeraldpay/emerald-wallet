import { moduleName } from "./types";

export function all(state: any) {
  return state[moduleName].get('addresses');
}

export const isLoading = (state: any): boolean => state[moduleName].get('loading');

export const find = (state: any, address: string, chain: string) => {
  if (!address) {
    return null;
  }
  return all(state).find(
    (a: any) => a.get('id') === address.toLowerCase() && a.get('blockchain') === chain);
};
