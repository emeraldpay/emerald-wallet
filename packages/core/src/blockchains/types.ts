export interface ITransaction {
  verifySignature (): boolean;
  getSenderAddress (): string;
  getRecipientAddress (): string;
  getValue (): any;
  getHash (): string;
  getData (): any;
}
