import { EthereumAddress } from './Address';
import { AnyCoinCode, AnyTokenCode } from '../../Asset';
import { IBlockchain } from '../IBlockchain';
import IBlockchainParams from '../IBlockchainParams';

export default class Ethereum implements IBlockchain {
  public params: IBlockchainParams;
  public title: string;
  public readonly tokens: AnyTokenCode[];

  constructor(params: IBlockchainParams, title: string, tokens: AnyTokenCode[]) {
    this.params = params;
    this.title = title;
    this.tokens = tokens;
  }

  public getAssets(): AnyCoinCode[] {
    const result: AnyCoinCode[] = [this.params.coinTicker];

    result.push(...this.tokens);

    return result;
  }

  public getTitle(): string {
    return this.title;
  }

  public isValidAddress(address: string): boolean {
    return EthereumAddress.isValid(address);
  }
}
