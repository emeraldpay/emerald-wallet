import {PersistentStateImpl} from "../api";
import {tempPath} from "./_commons";
import {BlockchainCode, blockchainCodeToId} from "@emeraldwallet/core";

describe('Tx Meta', () => {
  let state: PersistentStateImpl;
  beforeEach(() => {
    state = new PersistentStateImpl(tempPath('tx-meta'));
  });
  afterEach(() => {
    // close current after each test, otherwise it may reuse same instance for the next text
    state.close();
  });

  test('no meta', async () => {
    const act = await state.txmeta.get(BlockchainCode.ETH, "0x61a7f27b1a8b844aaeed7afd80558590c40bdc5898aca6dac0853d804a375478");
    expect(act).toBeNull();
  });

  test('set meta', async () => {
    const saved = await state.txmeta.set({
      blockchain: BlockchainCode.ETH,
      txId: "0x61a7f27b1a8b844aaeed7afd80558590c40bdc5898aca6dac0853d804a375478",
      timestamp: new Date('2021-03-05T10:11:12.000+0300'),
      label: "test label"
    });
    expect(saved).not.toBeNull();

    const act = await state.txmeta.get(BlockchainCode.ETH, "0x61a7f27b1a8b844aaeed7afd80558590c40bdc5898aca6dac0853d804a375478");
    expect(act).not.toBeNull();

    expect(act.label).toBe("test label")
  });

  test('update meta', async () => {
    await state.txmeta.set({
      blockchain: BlockchainCode.ETH,
      txId: "0x61a7f27b1a8b844aaeed7afd80558590c40bdc5898aca6dac0853d804a375478",
      timestamp: new Date('2021-03-05T10:11:12.000+0300'),
      label: "test label"
    });

    await state.txmeta.set({
      blockchain: BlockchainCode.ETH,
      txId: "0x61a7f27b1a8b844aaeed7afd80558590c40bdc5898aca6dac0853d804a375478",
      timestamp: new Date('2021-03-05T10:11:15.000+0300'),
      label: "test label 2"
    });


    const act = await state.txmeta.get(BlockchainCode.ETH, "0x61a7f27b1a8b844aaeed7afd80558590c40bdc5898aca6dac0853d804a375478");
    expect(act).not.toBeNull();

    expect(act.label).toBe("test label 2")
  });

});
