import {Map} from "immutable";
import {initialState} from "./reducer";

function conn(state: any): Map<string, any> {
  return state.conn || initialState;
}
export function isOffline(state: any): boolean {
  return getStatus(state) === "DISCONNECTED";
}
export function isConnected(state: any): boolean {
  return getStatus(state) === "CONNECTED";
}
export function getStatus(state: any): string {
  return conn(state).get("status");
}