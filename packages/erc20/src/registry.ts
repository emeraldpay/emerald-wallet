import { AnyTokenCode, BlockchainCode, CoinTickerCode } from '@emeraldwallet/core';

export interface TokenInfo {
  address: string;
  decimals: number;
  symbol: AnyTokenCode | CoinTickerCode;
}

type TokenCollection = { [code in BlockchainCode]?: TokenInfo[] };

class Registry {
  private tokens: TokenCollection = {
    [BlockchainCode.ETC]: [
      {
        address: '0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a',
        decimals: 18,
        symbol: 'WETC',
      },
    ],
    [BlockchainCode.ETH]: [
      {
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        symbol: 'DAI',
      },
      {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
        symbol: 'USDC',
      },
      {
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        decimals: 6,
        symbol: 'USDT',
      },
      {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        symbol: 'WETH',
      },
    ],
    [BlockchainCode.Goerli]: [
      {
        address: '0xaFF4481D10270F50f203E0763e2597776068CBc5',
        decimals: 18,
        symbol: 'WEENUS',
      },
      {
        address: '0x0Bb7509324cE409F7bbC4b701f932eAca9736AB7',
        decimals: 18,
        symbol: 'WETG',
      },
    ],
  };

  all(): TokenCollection {
    return this.tokens;
  }

  byBlockchain(blockchain: BlockchainCode): TokenInfo[] | undefined {
    return this.tokens[blockchain];
  }

  byTokenAddress(blockchain: BlockchainCode, address: string): TokenInfo | undefined {
    return this.tokens[blockchain]?.find((token) => token.address.toLowerCase() === address.toLowerCase());
  }

  byTokenSymbol(blockchain: BlockchainCode, symbol: string): TokenInfo | undefined {
    return this.tokens[blockchain]?.find((token) => token.symbol === symbol);
  }
}

export default new Registry();
