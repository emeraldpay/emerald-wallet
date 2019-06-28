import {BlockchainParams} from '../types';

class EthereumParams implements BlockchainParams {
  decimals: number = 18;
  coinTicker: string;
  chainId: number;

  constructor(coinTicker: string, chainId: number) {
    this.coinTicker = coinTicker;
    this.chainId = chainId;
  }
}

export default EthereumParams;
