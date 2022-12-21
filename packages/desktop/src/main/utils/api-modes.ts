import { ApiMode } from '@emeraldwallet/electron-app';

export const DevelopmentMode: ApiMode = {
  id: 'development',
  chains: ['ETH', 'ETC', 'BTC', 'GOERLI', 'TESTBTC'],
  assets: ['ETH', 'ETC', 'BTC'],
};

export const ProductionMode: ApiMode = {
  id: 'production',
  chains: ['ETH', 'ETC', 'BTC'],
  assets: ['ETH', 'ETC', 'BTC'],
};
