export interface BitcoinRawTransactionInput {
  sequence: number;
  txid: string;
  vout: number;
}

export interface BitcoinRawTransactionOutput {
  scriptPubKey: {
    address: string;
  };
  value: number;
}

export interface BitcoinRawTransaction {
  vin: BitcoinRawTransactionInput[];
  vout: BitcoinRawTransactionOutput[];
}

export function isBitcoinRawTransaction(tx: unknown): tx is BitcoinRawTransaction {
  return tx != null && typeof tx === 'object' && 'vin' in tx && Array.isArray(tx.vin);
}
