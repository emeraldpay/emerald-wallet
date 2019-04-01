import {BlockchainParams} from '../types';
import {CoinTicker} from '../CoinTicker';

class EthereumParams implements BlockchainParams {
  decimals: number = 18;
  coinTicker: string = CoinTicker.ETH;

}

export default EthereumParams;
