import {EthereumParams} from "../ethereum";
import {CoinTicker} from '../CoinTicker';

export class ClassicParams extends EthereumParams {
  coinTicker: string = CoinTicker.ETC;
  chainId = 61;
}

export default ClassicParams;

