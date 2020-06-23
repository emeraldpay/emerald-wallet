import { BlockchainCode } from '@emeraldwallet/core';
import { registry } from './registry';

describe('registry', () => {
  it('should find by symbol', () => {
    const token = registry.bySymbol(BlockchainCode.ETH, 'USDT');
    expect(token.symbol).toEqual('USDT');
    expect(token.address).toEqual('0xdac17f958d2ee523a2206206994597c13d831ec7');
    expect(token.decimals).toEqual(6);
  });

  it('should find by token address', () => {
    const token = registry.byAddress(BlockchainCode.ETH, '0x6B175474E89094C44Da98b954EedeAC495271d0F');
    expect(token).toBeDefined();
    if (token) {
      expect(token.symbol).toEqual('DAI');
    }
  });
});
