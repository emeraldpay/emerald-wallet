import IBlockchainParams from './IBlockchainParams';

export interface Blockchain {
  params: IBlockchainParams;

  isValidAddress (address: string): boolean;
  getTitle (): string;
}
