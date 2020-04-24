import { AnyCoinCode } from '../Asset';
import IBlockchainParams from './IBlockchainParams';

export interface IBlockchain {
  params: IBlockchainParams;

  isValidAddress (address: string): boolean;
  getTitle (): string;
  getAssets (): AnyCoinCode[];
}
