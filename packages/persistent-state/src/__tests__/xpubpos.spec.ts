import { PersistentStateImpl } from '../api';
import { tempPath } from './_commons';

describe('XPub Position', () => {
  let state: PersistentStateImpl;

  beforeEach(() => {
    state = new PersistentStateImpl(tempPath('xpubpos'));
  });

  test('default is zero', async () => {
    const act = await state.xpubpos.getNext(
      'xpub661MyMwAqRbcGczjuMoRm6dXaLDEhW1u34gKenbeYqAix21mdUKJyuyu5F1rzYGVxyL6tmgBUAEPrEz92mBXjByMRiJdba9wpnN37RLLAXa',
    );
    expect(act).toBe(0);
  });

  test('update to a larger value', async () => {
    const xpub =
      'xpub661MyMwAqRbcGczjuMoRm6dXaLDEhW1u34gKenbeYqAix21mdUKJyuyu5F1rzYGVxyL6tmgBUAEPrEz92mBXjByMRiJdba9wpnN37RLLAXa';

    const act = await state.xpubpos.getNext(xpub);
    expect(act).toBe(0);

    await state.xpubpos.setCurrentAddressAt(xpub, 4);

    const act2 = await state.xpubpos.getNext(xpub);
    expect(act2).toBe(5);
  });

  test("doesn't update to a smaller value", async () => {
    const xpub =
      'xpub661MyMwAqRbcGczjuMoRm6dXaLDEhW1u34gKenbeYqAix21mdUKJyuyu5F1rzYGVxyL6tmgBUAEPrEz92mBXjByMRiJdba9wpnN37RLLAXa';

    await state.xpubpos.setCurrentAddressAt(xpub, 4);
    const act = await state.xpubpos.getNext(xpub);
    expect(act).toBe(5);

    await state.xpubpos.setCurrentAddressAt(xpub, 3);

    const act2 = await state.xpubpos.getNext(xpub);
    expect(act2).toBe(5);
  });
});
