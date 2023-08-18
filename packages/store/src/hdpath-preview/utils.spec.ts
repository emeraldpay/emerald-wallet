import { SeedReference } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { INITIAL_STATE } from './reducer';
import { AccountState, HDPreviewState } from './types';
import { mergeAddress } from './utils';

describe('updateForAccount', () => {
  const seed: SeedReference = {
    type: 'id',
    value: '4701306d-d0f5-4883-81a6-4ba3a12d9349',
  };
  const update: AccountState = {
    seed,
    address: '0x3633c7cb94b6fe04bfd22f99706479c4371e2a4b',
    asset: 'ETH',
    blockchain: BlockchainCode.ETH,
    hdpath: "m/44'/60'/0'/0/0",
  };

  it('add when empty', () => {
    const act = mergeAddress(INITIAL_STATE, update);

    expect(act.accounts).toBeDefined();
    expect(act.accounts.length).toBe(1);
    expect(act.accounts[0].seed).toEqual(seed);
    expect(act.accounts[0].address).toBe(update.address);
  });

  it('replace address if exists with same hdpath', () => {
    const state: HDPreviewState = {
      ...INITIAL_STATE,
      accounts: [
        {
          ...update,
          address: '0x6b3efd5015e93e1dc2afc0efb44324bb2d8114f3',
        },
      ],
    };

    const merged = mergeAddress(state, update);

    expect(merged.accounts).toBeDefined();
    expect(merged.accounts.length).toBe(1);
    expect(merged.accounts[0].seed).toEqual(seed);
    expect(merged.accounts[0].address).toBe('0x3633c7cb94b6fe04bfd22f99706479c4371e2a4b');
  });

  it('keeps other accounts', () => {
    const state: HDPreviewState = {
      ...INITIAL_STATE,
      accounts: [
        {
          seed: seed,
          blockchain: BlockchainCode.ETH,
          hdpath: "m/44'/60'/1'/0/0",
          address: '0x6b3efd5015e93e1dc2afc0efb44324bb2d8114f3',
          asset: 'ETH',
        },
      ],
    };

    const merged = mergeAddress(state, update);

    expect(merged.accounts).toBeDefined();
    expect(merged.accounts.length).toBe(2);

    const accounts = merged.accounts.sort((first, second) => first.hdpath.localeCompare(second.hdpath));

    expect(accounts[0].hdpath).toBe("m/44'/60'/0'/0/0");
    expect(accounts[1].hdpath).toBe("m/44'/60'/1'/0/0");
  });

  it('merge with balance', () => {
    const state: HDPreviewState = {
      ...INITIAL_STATE,
      accounts: [
        {
          address: '0x6b3efd5015e93e1dc2afc0efb44324bb2d8114f3',
          asset: 'ETH',
          blockchain: BlockchainCode.ETH,
          hdpath: "m/44'/60'/0'/0/0",
          seed: seed,
        },
      ],
    };

    const merged = mergeAddress(state, {
      seed,
      address: '0x6b3efd5015e93e1dc2afc0efb44324bb2d8114f3',
      asset: 'ETH',
      balance: '100',
      blockchain: BlockchainCode.ETH,
    });

    expect(merged.accounts).toBeDefined();
    expect(merged.accounts.length).toBe(1);
    expect(merged.accounts[0].balance).toBe('100');
  });
});
