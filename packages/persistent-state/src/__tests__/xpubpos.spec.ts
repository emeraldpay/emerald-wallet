import {tempPath} from "./_commons";
import {EmeraldStateManager} from "../api";

describe("XPub Position", () => {

  let state: EmeraldStateManager;
  beforeEach(() => {
    state = new EmeraldStateManager(tempPath("xpubpos"));
  });

  test("default is zero", async () => {
    let act = await state.xpubpos.get("xpub661MyMwAqRbcGczjuMoRm6dXaLDEhW1u34gKenbeYqAix21mdUKJyuyu5F1rzYGVxyL6tmgBUAEPrEz92mBXjByMRiJdba9wpnN37RLLAXa");
    expect(act).toBe(0)
  });

  test("update to a larger value", async () => {
    let xpub = "xpub661MyMwAqRbcGczjuMoRm6dXaLDEhW1u34gKenbeYqAix21mdUKJyuyu5F1rzYGVxyL6tmgBUAEPrEz92mBXjByMRiJdba9wpnN37RLLAXa";

    let act = await state.xpubpos.get(xpub);
    expect(act).toBe(0)

    await state.xpubpos.set_at_least(xpub, 5);

    let act2 = await state.xpubpos.get(xpub);
    expect(act2).toBe(5)
  });

  test("doesn't update to a smaller value", async () => {
    let xpub = "xpub661MyMwAqRbcGczjuMoRm6dXaLDEhW1u34gKenbeYqAix21mdUKJyuyu5F1rzYGVxyL6tmgBUAEPrEz92mBXjByMRiJdba9wpnN37RLLAXa";

    await state.xpubpos.set_at_least(xpub, 5);
    let act = await state.xpubpos.get(xpub);
    expect(act).toBe(5)

    await state.xpubpos.set_at_least(xpub, 3);

    let act2 = await state.xpubpos.get(xpub);
    expect(act2).toBe(5)
  });

})
