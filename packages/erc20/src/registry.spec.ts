import { BlockchainCode } from '@emeraldwallet/core';
import { registry } from './registry';

describe('registry', () => {
  it('should find by symbol', () => {
    const token = registry.bySymbol(BlockchainCode.ETC, 'BEC');
    expect(token.symbol).toEqual('BEC');
    expect(token.address).toEqual('0x085fb4f24031eaedbc2b611aa528f22343eb52db');
    expect(token.decimals).toEqual(8);
  });

  it('should find by token address', () => {
    const token = registry.byAddress(BlockchainCode.ETC, '0x085fb4f24031eaedbc2b611aa528f22343eb52db');
    expect(token).toBeDefined();
    if (token) {
      expect(token.symbol).toEqual('BEC');
    }
  });
});
