import { ApiMode } from '@emeraldwallet/electron-app';

export const DevelopmentMode: ApiMode = {
  id: 'development',
  chains: ['ETH', 'ETC', 'BTC', 'GOERLI', 'KOVAN', 'TESTBTC'],
  assets: ['ETH', 'ETC', 'BTC', 'DAI', 'USDC', 'USDT', 'WETH', 'TESTBTC'],
  currencies: ['USD'],
};

export const ProductionMode: ApiMode = {
  id: 'production',
  chains: ['ETH', 'ETC', 'BTC'],
  assets: ['ETH', 'ETC', 'DAI', 'USDC', 'USDT', 'WETH'],
  currencies: ['USD', 'EUR', 'USDC', 'USDT', 'BTC'],
};

export function sendMode(webContents, mode): void {
  webContents.send('store', {
    type: 'SETTINGS/MODE',
    payload: mode,
  });
}
