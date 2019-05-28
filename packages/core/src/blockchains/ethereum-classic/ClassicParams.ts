import {EthereumParams} from "../ethereum";
import {CoinTicker} from '../CoinTicker';

export class ClassicParams extends EthereumParams {
  coinTicker: string = CoinTicker.ETC;
}

export default ClassicParams;

