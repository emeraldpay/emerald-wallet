export interface LedgerAddress {
  address: string | null;
  hdpath: string;
  value: any | null;
  txcount?: any;
}

export interface Selectable {
  selected?: boolean;
}
