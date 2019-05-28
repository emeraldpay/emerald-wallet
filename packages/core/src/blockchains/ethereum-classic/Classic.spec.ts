import EthereumClassic from './Classic';

describe('EthereumClassic', () => {
  it('should have coin ticker ETC', () => {
    expect(new EthereumClassic().params.coinTicker).toEqual('ETC');
  })
});
