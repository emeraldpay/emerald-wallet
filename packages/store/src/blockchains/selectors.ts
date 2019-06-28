import {Wei} from "@emeraldplatform/eth";
import {moduleName} from "./types";

export function all(state: any) {
  return state[moduleName];
}

export function gasPrice(state: any, chain: string): Wei {
  return state[moduleName].get(chain).gasPrice;
}

export function getHeight(state: any, chain: string): number {
  const data = state[moduleName].get(chain.toLowerCase());
  if (!data) {
    console.error('unknown chain', chain);
    return 0;
  }
  if (!data.height) {
    console.warn('Chain is not updated yet', chain);
    return 0;
  }
  return data.height;
}