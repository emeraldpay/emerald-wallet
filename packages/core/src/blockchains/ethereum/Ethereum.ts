import { EthAddress } from '@emeraldplatform/core';
import { Blockchain } from '../Blockchain';
import BlockchainParams from '../BlockchainParams';

export default class Ethereum implements Blockchain {
  public params: BlockchainParams;
  public title: string;

  constructor (params: BlockchainParams, title: string) {
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
