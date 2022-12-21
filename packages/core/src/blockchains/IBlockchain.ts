import IBlockchainParams from './IBlockchainParams';

export interface IBlockchain {
  params: IBlockchainParams;
  getTitle(): string;
  isValidAddress(address: string): boolean;
}
