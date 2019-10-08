export interface Account {
  address: string;
  name: string;
  description: string;
  hidden: boolean;
  hardware: boolean;
}

export interface TxSignRequest {
  from: string;
  to?: string | null;
  gas: number;
  gasPrice: string;
  value: string;
  data?: string | null;
  nonce: number;
}

/**
 * Address book item
 */
export interface Contact {
  address: string;
  name?: string;
  description?: string;
}
