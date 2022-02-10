import { AnyTokenCode, BlockchainCode, CoinTickerCode } from '@emeraldwallet/core';

export interface ITokenInfo {
  address: string;
  decimals: number;
  symbol: AnyTokenCode | CoinTickerCode; // Coins are accepted because of selection in CreateTransaction, FIXME
}

type TokensCollection = {
  [code in BlockchainCode]: ITokenInfo[];
};

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
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        symbol: 'DAI'
      },
      {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
        symbol: 'USDC'
      },
      {
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        decimals: 6,
        symbol: 'USDT'
      },
      {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        symbol: 'WETH'
      }
    ],
    [BlockchainCode.Kovan]: [
      {
        address: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
        decimals: 18,
        symbol: 'WEENUS'
      },
      {
        address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
        decimals: 18,
        symbol: 'WETH'
      }
    ],
    [BlockchainCode.Goerli]: [
      {
        address: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
        decimals: 18,
        symbol: 'WEENUS'
      },
      {
        address: '0x0Bb7509324cE409F7bbC4b701f932eAca9736AB7',
        decimals: 18,
        symbol: 'WETH'
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
