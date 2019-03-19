export interface Transaction {
  verifySignature(): boolean;
  getSenderAddress(): string;
}

/**
 * Parameters of particular blockchain
 */
export interface BlockchainParams {
  decimals: number;
}