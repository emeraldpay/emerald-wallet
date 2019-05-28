import {ClassicParams} from './ClassicParams';

describe('ClassicParams', () => {
  it('should have correct params', () => {
    const params = new ClassicParams();
    expect(params.coinTicker).toEqual('ETC');
    expect(params.decimals).toEqual(18);
  })
});
