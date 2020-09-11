import {
  AnyTokenCode, BlockchainCode, CoinTickerCode
} from '@emeraldwallet/core';

type TokensCollection = {
  [code in BlockchainCode]: ITokenInfo[];
};

export interface ITokenInfo {
  address: string;
  decimals: number;
  symbol: AnyTokenCode | CoinTickerCode; // Coins are accepted because of selection in CreateTransaction, FIXME
}

/**
 * Empty wrapper as a workaround typescript type losing
 */
function createTokenInfos (info: TokensCollection): TokensCollection {
  return info;
}

export const registry = {
  tokens: createTokenInfos({
    [BlockchainCode.ETC]: [
    ],
    [BlockchainCode.ETH]: [
      {
        address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
        decimals: 18,
        symbol: 'SAI'
      },
      {
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        symbol: 'DAI'
      },
      {
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        decimals: 6,
        symbol: 'USDT'
      }
    ],
    [BlockchainCode.Kovan]: [
      {
        address: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
        decimals: 18,
        symbol: 'WEENUS'
      }
    ],
    [BlockchainCode.Unknown]: [],
    [BlockchainCode.BTC]: [],
    [BlockchainCode.TestBTC]: [],
  }),
  all: () => {
    return registry.tokens;
  },
  bySymbol: (chain: BlockchainCode, symbol: string): ITokenInfo => {
    const forChain: any[] = registry.tokens[chain];
    const result = forChain.filter((v) => v.symbol === symbol);
    if (result.length < 1) {
      throw new Error(`Could not find token with symbol ${symbol} for chain ${chain}`);
    }
    return result[0];
  },
  byAddress: (chain: BlockchainCode, address: string): ITokenInfo | null => {
    const forChain: any[] = registry.tokens[chain];
    const result = forChain.filter((v) => v.address.toLowerCase() === address.toLowerCase());
    if (result.length >= 1) {
      return result[0];
    }
    return null;
  }
};
