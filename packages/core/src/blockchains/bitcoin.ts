import {IBlockchain} from "./IBlockchain";
import IBlockchainParams from "./IBlockchainParams";
import {AnyCoinCode} from "../Asset";

export class Bitcoin implements IBlockchain {
  params: IBlockchainParams;

  constructor(params: IBlockchainParams) {
    this.params = params;
  }

  getAssets(): AnyCoinCode[] {
    return [this.params.coinTicker];
  }

  getTitle(): string {
    return "Bitcoin";
  }

  isValidAddress(address: string): boolean {
    return address.startsWith("bc1") || address.startsWith("tb1");
  }

}