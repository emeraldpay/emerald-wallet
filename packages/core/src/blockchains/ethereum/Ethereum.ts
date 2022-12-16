import { EthereumAddress } from './EthereumAddress';
import { IBlockchain } from '../IBlockchain';
import IBlockchainParams from '../IBlockchainParams';

export default class Ethereum implements IBlockchain {
  public params: IBlockchainParams;
  public title: string;

  constructor(params: IBlockchainParams, title: string) {
    this.params = params;
    this.title = title;
  }

  public getTitle(): string {
    return this.title;
  }

  public isValidAddress(address: string): boolean {
    return EthereumAddress.isValid(address);
  }
}
