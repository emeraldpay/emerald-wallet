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
    [BlockchainCode.Kovan]: [],
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
  }
};
