export interface Transaction {
  verifySignature(): boolean;
  getSenderAddress(): string;
}