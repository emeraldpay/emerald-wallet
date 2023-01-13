import { BlockchainCode } from '@emeraldwallet/core';
import { tempPath } from './_commons';
import { PersistentStateManager } from '../api';

describe('Tx Meta', () => {
  let manager: PersistentStateManager;

  beforeEach(() => {
    manager = new PersistentStateManager(tempPath('tx-meta'));
  });

  afterEach(() => {
    // close current after each test, otherwise it may reuse same instance for the next text
    manager.close();
  });

  test('no meta', async () => {
    const act = await manager.txmeta.get(
      BlockchainCode.ETH,
      '0x61a7f27b1a8b844aaeed7afd80558590c40bdc5898aca6dac0853d804a375478',
    );
    expect(act).toBeNull();
  });

  test('set meta', async () => {
    const saved = await manager.txmeta.set({
      blockchain: BlockchainCode.ETH,
      label: 'test label',
      timestamp: new Date('2021-03-05T10:11:12.000+0300'),
      txId: '0x61a7f27b1a8b844aaeed7afd80558590c40bdc5898aca6dac0853d804a375478',
    });
    expect(saved).not.toBeNull();

    const act = await manager.txmeta.get(
      BlockchainCode.ETH,
      '0x61a7f27b1a8b844aaeed7afd80558590c40bdc5898aca6dac0853d804a375478',
    );
    expect(act).not.toBeNull();

    expect(act.label).toBe('test label');
  });

  test('update meta', async () => {
    await manager.txmeta.set({
      blockchain: BlockchainCode.ETH,
      label: 'test label',
      timestamp: new Date('2021-03-05T10:11:12.000+0300'),
      txId: '0x61a7f27b1a8b844aaeed7afd80558590c40bdc5898aca6dac0853d804a375478',
    });

    await manager.txmeta.set({
      blockchain: BlockchainCode.ETH,
      label: 'test label 2',
      timestamp: new Date('2021-03-05T10:11:15.000+0300'),
      txId: '0x61a7f27b1a8b844aaeed7afd80558590c40bdc5898aca6dac0853d804a375478',
    });

    const act = await manager.txmeta.get(
      BlockchainCode.ETH,
      '0x61a7f27b1a8b844aaeed7afd80558590c40bdc5898aca6dac0853d804a375478',
    );
    expect(act).not.toBeNull();

    expect(act.label).toBe('test label 2');
  });
});
