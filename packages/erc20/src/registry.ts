import { BlockchainCode } from '@emeraldwallet/core';

type TokensCollection = {
  [code in BlockchainCode]: any[];
};

export const registry = {
  tokens: {
    [BlockchainCode.ETC]: [
      {
        address: '0x085fb4f24031eaedbc2b611aa528f22343eb52db',
        decimals: 8,
        symbol: 'BEC'
      }
    ],
    [BlockchainCode.ETH]: [],
    [BlockchainCode.Morden]: [],
    [BlockchainCode.Kovan]: [
      {
        address: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
        decimals: 18,
        symbol: 'WEENUS'
      }
    ],
    [BlockchainCode.Unknown]: []
  } as TokensCollection,
  all: () => {
    return registry.tokens;
  },
  bySymbol: (chain: BlockchainCode, symbol: string) => {
    const forChain: any[] = registry.tokens[chain];
    const result = forChain.filter((v) => v.symbol === symbol);
    if (result.length < 1) {
      throw new Error(`Could not find token with symbol ${symbol} for chain ${chain}`);
    }
    return result[0];
  },
  byAddress: (chain: BlockchainCode, address: string) => {
    const forChain: any[] = registry.tokens[chain];
    const result = forChain.filter((v) => v.address.toLowerCase() === address.toLowerCase());
    if (result.length >= 1) {
      return result[0];
    }
    return null;
  }
};
