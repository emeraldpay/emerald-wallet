import { Wei } from "@emeraldplatform/eth";

export enum ActionTypes {
  ADDR_BALANCE = 'LEDGER/ADDR_BALANCE',
  ADDR_TXCOUNT = 'LEDGER/ADDR_TXCOUNT',
  ADDR = 'LEDGER/ADDR',
  SET_LIST_HDPATH = 'LEDGER/SET_LIST_HDPATH',
  CONNECTED = 'LEDGER/CONNECTED',
  WATCH = 'LEDGER/WATCH',
  ADDR_SELECTED = 'LEDGER/ADDR_SELECTED',
  SET_HDOFFSET = 'LEDGER/SET_HDOFFSET',
  SET_BASEHD = 'LEDGER/SET_BASEHD',
}

export interface Address {
  type: ActionTypes.ADDR;
  addr: string;
  hdpath: string;
}

export interface AddressBalance {
  type: ActionTypes.ADDR_BALANCE;
  hdpath: string;
  value: Wei
}

export interface AddressTxCount {
  type: ActionTypes.ADDR_TXCOUNT;
  hdpath: string;
  value: number;
}

export interface Connected {
  type: ActionTypes.CONNECTED;
  value: boolean;
}

export interface SetHDOffset {
  type: ActionTypes.SET_HDOFFSET;
  value: number;
}

export interface AddressSelected {
  type: ActionTypes.ADDR_SELECTED;
  value?: string;
}

export interface SetListHDPath {
  type: ActionTypes.SET_LIST_HDPATH;
  index: number,
  hdpath: string
}

export interface Watch {
  type: ActionTypes.WATCH;
  value: boolean;
}

export interface SetBaseHD {
  type: ActionTypes.SET_BASEHD;
  value: string;
}

export type LedgerAction =
  | Address
  | AddressBalance
  | AddressTxCount
  | Connected
  | SetHDOffset
  | AddressSelected
  | SetListHDPath
  | Watch
  | SetBaseHD;