import {BlockchainParams} from '../types';
import {CoinTicker} from '../CoinTicker';

class EthereumParams implements BlockchainParams {
  decimals: number = 18;
  coinTicker: string = CoinTicker.ETH;
  chainId = 1;
}

export default EthereumParams;
