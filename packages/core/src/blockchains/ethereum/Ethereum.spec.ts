import Ethereum from './Ethereum';

describe('Ethereum', () => {
  it('should have coin ticker ETH', () => {
    expect(new Ethereum().params.coinTicker).toEqual('ETH');
  })
});
