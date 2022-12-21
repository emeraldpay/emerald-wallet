import {EthereumAddress} from "./ethereum/EthereumAddress";

export interface ITransaction {
  verifySignature(): boolean;

  getSenderAddress(): EthereumAddress;

  getRecipientAddress(): EthereumAddress;

  // hex encoded
  getValue(): string;

  getHash(): string;

  getData(): string;

  getNonce(): number;
}
