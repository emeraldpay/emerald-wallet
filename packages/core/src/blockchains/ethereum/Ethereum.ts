import { EthAddress } from '@emeraldplatform/core';
import { Blockchain } from '../Blockchain';
import IBlockchainParams from '../IBlockchainParams';
import {AnyCoinCode, AnyTokenCode} from "../../Asset";

export default class Ethereum implements Blockchain {
  public params: IBlockchainParams;
  public title: string;
  public readonly tokens: AnyTokenCode[];

  constructor (params: IBlockchainParams, title: string, tokens: AnyTokenCode[]) {
    this.params = params;
    this.title = title;
    this.tokens = tokens;
  }

  public isValidAddress (address: string): boolean {
    return EthAddress.fromHexString(address).isValid();
  }

  public getTitle (): string {
    return this.title;
  }

  getAssets(): AnyCoinCode[] {
    const result = [this.params.coinTicker];
    result.push(...this.tokens);
    return result;
  }

}
