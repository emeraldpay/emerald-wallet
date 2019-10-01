import { EthAddress } from '@emeraldplatform/core';
import { Blockchain } from '../Blockchain';
import IBlockchainParams from '../IBlockchainParams';

export default class Ethereum implements Blockchain {
  public params: IBlockchainParams;
  public title: string;

  constructor (params: IBlockchainParams, title: string) {
    this.params = params;
    this.title = title;
  }

  public isValidAddress (address: string): boolean {
    return EthAddress.fromHexString(address).isValid();
  }

  public getTitle (): string {
    return this.title;
  }
}
