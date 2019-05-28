import {BlockchainParams} from '../types';
import {CoinTicker} from "../CoinTicker";

class SmiloParams implements BlockchainParams {
  decimals: number = 18;
  tokenSymbol: string = "XSM";
  coinTicker: string = CoinTicker.XSM;
}

export default SmiloParams;
