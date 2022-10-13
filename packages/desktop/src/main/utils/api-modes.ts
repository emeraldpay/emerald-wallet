import { ApiMode } from '@emeraldwallet/electron-app';

export const DevelopmentMode: ApiMode = {
  id: 'development',
  chains: ['ETH', 'ETC', 'BTC', 'GOERLI', 'TESTBTC'],
  assets: ['ETH', 'ETC', 'BTC', 'DAI', 'USDC', 'USDT', 'WETH', 'WETC', 'TESTBTC'],
  currencies: ['USD'],
};

export const ProductionMode: ApiMode = {
  id: 'production',
  chains: ['ETH', 'ETC', 'BTC'],
  assets: ['ETH', 'ETC', 'BTC', 'DAI', 'USDC', 'USDT', 'WETH', 'WETC'],
  currencies: ['USD', 'EUR', 'BTC', 'USDC', 'USDT'],
};

export function sendMode(webContents, mode): void {
  webContents.send('store', {
    type: 'SETTINGS/MODE',
    payload: mode,
  });
}
