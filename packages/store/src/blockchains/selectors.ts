import {moduleName} from "./types";

export function all(state: any) {
  return state[moduleName];
}

export function gasPrice(state: any, chain: string) {
  return state[moduleName].get(chain).gasPrice;
}
