import { Blockchain, ConnectionStatus } from '@emeraldpay/api';
import { EmeraldApiAccessProd } from './ApiAccess';

jest.setTimeout(10000);

describe('ApiAccess', () => {
  test('should connect without errors', async () => {
    const apiAccess = new EmeraldApiAccessProd('test', {
      appLocale: 'en-US',
      appVersion: '0.0.0',
      chromeVersion: '0.0.0',
      commitData: {
        commitDate: '01.01.1970',
        shortSha: 'cafe64',
      },
      electronVersion: '0.0.0',
      osVersion: {
        arch: 'x64',
        platform: 'test',
        release: 'test',
      },
    });

    let blockchainStatus = ConnectionStatus.PENDING;

    apiAccess.blockchainClient.setConnectionListener((status) => {
      if (status !== blockchainStatus) {
        expect(status).toBeGreaterThanOrEqual(blockchainStatus);
      }

      blockchainStatus = status;
    });

    let marketStatus = ConnectionStatus.PENDING;

    apiAccess.marketClient.setConnectionListener((status) => {
      if (status !== marketStatus) {
        expect(status).toBeGreaterThanOrEqual(marketStatus);
      }

      marketStatus = status;
    });

    const balances = await apiAccess.blockchainClient.getBalance({
      address: '0x7af963cf6d228e564e2a0aa0ddbf06210b38615d',
      asset: {
        blockchain: Blockchain.ETHEREUM,
        code: 'ETHER',
      },
    });

    const rates = await apiAccess.marketClient.getRates([{ base: 'USD', target: 'BTC' }]);

    await new Promise((resolve) => setTimeout(resolve, 2 * 1000));

    apiAccess.close();

    expect(balances.length).toBeGreaterThan(0);
    expect(rates.length).toBeGreaterThan(0);

    expect(blockchainStatus).toBeGreaterThan(ConnectionStatus.CONNECTING);
    expect(marketStatus).toBeGreaterThan(ConnectionStatus.CONNECTING);
  });
});
