import { BlockchainCode } from './blockchains';
import { CoinTicker } from './coinTicker';

export enum Coin {
  BTC = 'BTC',
  ETHER = 'ETHER',
}

export type CoinCode = 'BTC' | 'ETHER';

export function getCoinAsset(asset: string, blockchain: BlockchainCode): string {
  if (asset === Coin.ETHER) {
    switch (blockchain) {
      case BlockchainCode.ETC:
        return CoinTicker.ETC;
      case BlockchainCode.ETH:
        return CoinTicker.ETH;
      case BlockchainCode.Goerli:
        return CoinTicker.ETG;
    }
  }

  return asset;
}
