import abi from './abi';

describe('abi', () => {
  it('should be erc20 abi', () => {
    expect(abi.find(i => i.name === 'approve')).toBeDefined();
    expect(abi.find(i => i.name === 'totalSupply')).toBeDefined();
  })
});
