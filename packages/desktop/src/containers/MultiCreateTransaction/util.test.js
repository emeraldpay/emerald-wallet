import { txFeeFiat } from './util';

describe('txFeeFiat', () => {
  it('should calculate tx fee in fiat', () => {
    const feeFiat = txFeeFiat(2000000000, 21000, 134.44);
    expect(feeFiat).toEqual('0.01');
  });
});
