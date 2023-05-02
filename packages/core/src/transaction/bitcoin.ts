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
