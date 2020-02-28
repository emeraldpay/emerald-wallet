import IBlockchainParams from './IBlockchainParams';
import {AnyCoinCode} from "../Asset";

export interface Blockchain {
  params: IBlockchainParams;

  isValidAddress (address: string): boolean;
  getTitle (): string;
  getAssets(): AnyCoinCode[]
}
