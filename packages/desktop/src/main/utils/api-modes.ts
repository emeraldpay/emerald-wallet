import { ApiMode } from '@emeraldwallet/electron-app';

export const DevelopmentMode: ApiMode = {
  id: 'development',
  chains: ['ETH', 'ETC', 'BTC', 'SEPOLIA', 'TESTBTC'],
};

export const ProductionMode: ApiMode = {
  id: 'production',
  chains: ['ETH', 'ETC', 'BTC'],
};
