import Ethereum from './Ethereum';
import EthereumParams from "./EthereumParams";
import {CoinTicker} from "../CoinTicker";

describe('Ethereum', () => {
  it('should have coin ticker ETH', () => {
    expect(new Ethereum(new EthereumParams(CoinTicker.ETH, 1, "m/44'/60'/160720'/0'"), "Ethereum").params.coinTicker).toEqual('ETH');
  })
});
