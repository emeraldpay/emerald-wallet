import { BlockchainCode } from '@emeraldwallet/core';
import { registry } from './registry';

describe('registry', () => {
  it('should find by symbol', () => {
    const token = registry.bySymbol(BlockchainCode.ETC, 'BEC');
    expect(token.symbol).toEqual('BEC');
    expect(token.address).toEqual('0x085fb4f24031eaedbc2b611aa528f22343eb52db');
    expect(token.decimals).toEqual(8);
  });
});
