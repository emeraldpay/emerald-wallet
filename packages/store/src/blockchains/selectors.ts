import {Wei} from "@emeraldplatform/eth";
import {IBlockchainsState, moduleName} from "./types";

export function all(state: any): IBlockchainsState {
  return state[moduleName];
}

export function gasPrice(state: any, chain: string): Wei {
  return state[moduleName].get(chain.toLowerCase()).gasPrice;
}

export function getHeight(state: any, chain: string): number {
  const data = state[moduleName].get(chain.toLowerCase());
  if (!data) {
    console.error('Unknown chain: ', chain);
    return 0;
  }
  if (!data.height) {
    console.warn('Chain is not updated yet', chain);
    return 0;
  }
  return data.height;
}
