import {moduleName} from "./types";

export function all(state: any) {
  return state[moduleName];
}
