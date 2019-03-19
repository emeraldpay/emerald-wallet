import { txFee, txFeeFiat } from './util';

describe('txFee', () => {
  it('should calculate tx fee from gas price and gas limit', () => {
    const fee = txFee(2000000000, 21000);
    expect(fee).toEqual('0.00004');
  });
});

describe('txFeeFiat', () => {
  it('should calculate tx fee in fiat', () => {
    const feeFiat = txFeeFiat(2000000000, 21000, 134.44);
    expect(feeFiat).toEqual('0.01');
  });
});
