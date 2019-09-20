import { BlockchainCode, isValidChain } from './blockchains';

describe('BlockchainCode', () => {
  it('should contain codes', () => {
    expect(BlockchainCode.ETC).toEqual('etc');
  });

  it('should be able to validate chain code', () => {
    expect(isValidChain('etc')).toBeTruthy();
    expect(isValidChain('ETC')).toBeFalsy();
  });
});
