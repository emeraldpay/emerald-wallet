import {BlockchainParams} from "./types";

export interface Blockchain {
  params: BlockchainParams;

  isValidAddress(address: string): boolean;
  getTitle(): string;
}