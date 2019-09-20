import { BlockchainCode } from '../blockchains';
import { CoinTicker } from '../CoinTicker';
import Ethereum from './Ethereum';
import EthereumParams from './EthereumParams';

describe('Ethereum', () => {
  it('should have coin ticker ETH', () => {
    expect(new Ethereum(new EthereumParams(BlockchainCode.ETH, CoinTicker.ETH, 1, "m/44'/60'/160720'/0'"), 'Ethereum').params.coinTicker).toEqual('ETH');
  });
});
