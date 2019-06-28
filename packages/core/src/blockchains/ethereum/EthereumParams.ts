import {BlockchainParams} from '../types';

class EthereumParams implements BlockchainParams {
  decimals: number = 18;
  coinTicker: string;
  chainId: number;
  hdPath: string;

  constructor(coinTicker: string, chainId: number, hdPaths: string) {
    this.coinTicker = coinTicker;
    this.chainId = chainId;
    this.hdPath = hdPaths;
  }
}

export default EthereumParams;
