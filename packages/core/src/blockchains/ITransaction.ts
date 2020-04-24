import { Address } from '@emeraldplatform/core';

export interface ITransaction {
  verifySignature (): boolean;
  getSenderAddress (): Address;
  getRecipientAddress (): Address;
  getValue (): any;
  getHash (): string;
  getData (): string;
  getNonce (): number;
}
