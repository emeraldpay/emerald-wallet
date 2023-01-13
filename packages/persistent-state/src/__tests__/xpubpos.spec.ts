import { tempPath } from './_commons';
import { PersistentStateManager } from '../api';

describe('XPub Position', () => {
  const xpub =
    'xpub661MyMwAqRbcGczjuMoRm6dXaLDEhW1u34gKenbeYqAix21mdUKJ' +
    'yuyu5F1rzYGVxyL6tmgBUAEPrEz92mBXjByMRiJdba9wpnN37RLLAXa';

  let manager: PersistentStateManager;

  beforeEach(() => {
    manager = new PersistentStateManager(tempPath('xpubpos'));
  });

  test('default is zero', async () => {
    const act = await manager.xpubpos.getNext(xpub);
    expect(act).toBe(0);
  });

  test('update to a larger value', async () => {
    const act = await manager.xpubpos.getNext(xpub);
    expect(act).toBe(0);

    await manager.xpubpos.setCurrentAddressAt(xpub, 4);

    const act2 = await manager.xpubpos.getNext(xpub);
    expect(act2).toBe(5);
  });

  test("doesn't update to a smaller value", async () => {
    await manager.xpubpos.setCurrentAddressAt(xpub, 4);

    const act = await manager.xpubpos.getNext(xpub);
    expect(act).toBe(5);

    await manager.xpubpos.setCurrentAddressAt(xpub, 3);

    const act2 = await manager.xpubpos.getNext(xpub);
    expect(act2).toBe(5);
  });
});
