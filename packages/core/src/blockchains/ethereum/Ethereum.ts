import { AnyCoinCode, AnyTokenCode } from '../../Asset';
import { IBlockchain } from '../IBlockchain';
import IBlockchainParams from '../IBlockchainParams';
import {EthereumAddress} from "./Address";

export default class Ethereum implements IBlockchain {
  public params: IBlockchainParams;
  public title: string;
  public readonly tokens: AnyTokenCode[];

  constructor (params: IBlockchainParams, title: string, tokens: AnyTokenCode[]) {
    this.params = params;
    this.title = title;
    this.tokens = tokens;
  }

  public isValidAddress (address: string): boolean {
    return EthereumAddress.isValid(address);
  }

  public getTitle (): string {
    return this.title;
  }

  public getAssets (): AnyCoinCode[] {
    const result = [this.params.coinTicker];
    result.push(...this.tokens);
    return result;
  }

}
