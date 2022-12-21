import { tokenAbi } from './abi';

describe('abi', () => {
  it('should be erc20 abi', () => {
    expect(tokenAbi.find((item) => item.name === 'approve')).toBeDefined();
    expect(tokenAbi.find((item) => item.name === 'totalSupply')).toBeDefined();
  });
});
