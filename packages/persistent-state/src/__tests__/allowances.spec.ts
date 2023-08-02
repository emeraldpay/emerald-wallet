import { tempPath } from './_commons';
import { PersistentStateManager } from '../api';
import {BlockchainCode, PersistentState} from "@emeraldwallet/core";

describe('Allowances', () => {
  let manager: PersistentStateManager;

  beforeEach(() => {
    manager = new PersistentStateManager(tempPath('allowances'));
  });

  afterEach(() => {
    manager.close();
  });

  test('empty on start', async () => {
    const act = await manager.allowances.list();
    expect(act.items.length).toBe(0);
  });

  test('add allowance', async () => {
    let allowance: PersistentState.CachedAllowance = {
      blockchain: BlockchainCode.ETH,
      token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      owner: '0x65A0947BA5175359Bb457D3b34491eDf4cBF7997',
      spender: '0x313Eb1C5e1970EB5CEEF6AEbad66b07c7338d369',
      amount: '1000000000000000000',
    }
    const added = await manager.allowances.add('dfd48ba8-9465-4589-a77e-d68625a6a375', allowance);
    expect(added).toBeTruthy();

    const act = await manager.allowances.list();
    expect(act.items.length).toBe(1);
    expect(act.items[0]).toEqual(allowance);
  });

});
