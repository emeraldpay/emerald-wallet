import { BlockchainCode } from '@emeraldwallet/core';
import { IState } from '../types';
import { getByAccount } from './selectors';
import { HDPreviewState } from './types';

describe('getByAccount', () => {
  const hdpathPreview: HDPreviewState = {
    accounts: [
      {
        address: '0xa309cdfe468b93c90e60af97e63a0ddf9ec710bc',
        asset: 'ETH',
        blockchain: BlockchainCode.ETH,
        hdpath: "m/44'/60'/0'/0/0",
        seed: { type: 'id', value: '6a05d867-1c21-4aaa-b083-cb10b38e5a33' },
      },
      {
        address: '0x2d4862a0b4983296eff77f25e97fbc2f4d558917',
        asset: 'ETH',
        balance: '10000',
        blockchain: BlockchainCode.ETC,
        hdpath: "m/44'/61'/0'/0/0",
        seed: { type: 'id', value: '6a05d867-1c21-4aaa-b083-cb10b38e5a33' },
      },
      {
        address: '0x5a8107eb87d2db27b5d3e49bccf3b542c21e551c',
        asset: 'ETH',
        balance: '10000',
        blockchain: BlockchainCode.ETH,
        hdpath: "m/44'/60'/1'/0/0",
        seed: { type: 'id', value: '6a05d867-1c21-4aaa-b083-cb10b38e5a33' },
      },
      {
        address: '0x5a8107eb87d2db27b5d3e49bccf3b542c21e551c',
        asset: 'DAI',
        balance: '200',
        blockchain: BlockchainCode.ETH,
        hdpath: "m/44'/60'/1'/0/0",
        seed: { type: 'id', value: '6a05d867-1c21-4aaa-b083-cb10b38e5a33' },
      },
    ],
    active: true,
    display: {
      account: 0,
      blockchains: [BlockchainCode.ETH, BlockchainCode.ETC],
      entries: [],
    },
  };

  const state = { hdpathPreview } as IState;

  it('get both chains', () => {
    const act = getByAccount(state, { type: 'id', value: '6a05d867-1c21-4aaa-b083-cb10b38e5a33' }, 0);

    expect(act.length).toBe(2);
    expect(act[0]).toEqual(hdpathPreview.accounts[0]);
    expect(act[1]).toEqual(hdpathPreview.accounts[1]);
  });

  it('get all assets', () => {
    const act = getByAccount(state, { type: 'id', value: '6a05d867-1c21-4aaa-b083-cb10b38e5a33' }, 1);

    expect(act.length).toBe(2);
    expect(act[0]).toEqual(hdpathPreview.accounts[2]);
    expect(act[1]).toEqual(hdpathPreview.accounts[3]);
  });
});
