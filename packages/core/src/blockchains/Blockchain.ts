import BlockchainParams from "./BlockchainParams";

export interface Blockchain {
  params: BlockchainParams;

  isValidAddress(address: string): boolean;
  getTitle(): string;
}
