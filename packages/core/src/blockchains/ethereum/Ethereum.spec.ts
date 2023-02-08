import { Ethereum } from './Ethereum';
import { EthereumParams } from './EthereumParams';
import { BlockchainCode } from '../blockchains';
import { Coin } from '../coin';
import { CoinTicker } from '../coinTicker';
import { HDPath } from '../HDPath';

describe('Ethereum', () => {
  it('should have coin ticker ETH', () => {
    expect(
      new Ethereum(
        new EthereumParams(BlockchainCode.ETH, Coin.ETHER, CoinTicker.ETH, 1, HDPath.parse("m/44'/60'/0'/0/0"), 12),
        'Ethereum',
      ).params.coinTicker,
    ).toEqual('ETH');
  });
});
