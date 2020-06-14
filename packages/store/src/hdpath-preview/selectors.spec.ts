import {IState} from "../types";
import {BlockchainCode} from "@emeraldwallet/core";
import {getByAccount} from "./selectors";
import {IHDPreviewState} from "./types";

describe('getByAccount', () => {

  const hdpathPreview: IHDPreviewState = {
    display: {account: 0},
    accounts: [
      {
        blockchain: BlockchainCode.ETH,
        seed: {type: "seed-ref", seedId: "6a05d867-1c21-4aaa-b083-cb10b38e5a33"},
        hdpath: "m/44'/60'/0'/0/0",
        asset: "ETH",
        address: "0xa309cdfe468b93c90e60af97e63a0ddf9ec710bc"
      },

      {
        blockchain: BlockchainCode.ETC,
        seed: {type: "seed-ref", seedId: "6a05d867-1c21-4aaa-b083-cb10b38e5a33"},
        hdpath: "m/44'/61'/0'/0/0",
        asset: "ETH",
        address: "0x2d4862a0b4983296eff77f25e97fbc2f4d558917",
        balance: "10000"
      },

      {
        blockchain: BlockchainCode.ETH,
        seed: {type: "seed-ref", seedId: "6a05d867-1c21-4aaa-b083-cb10b38e5a33"},
        hdpath: "m/44'/60'/1'/0/0",
        asset: "ETH",
        address: "0x5a8107eb87d2db27b5d3e49bccf3b542c21e551c",
        balance: "10000"
      },

      {
        blockchain: BlockchainCode.ETH,
        seed: {type: "seed-ref", seedId: "6a05d867-1c21-4aaa-b083-cb10b38e5a33"},
        hdpath: "m/44'/60'/1'/0/0",
        asset: "DAI",
        address: "0x5a8107eb87d2db27b5d3e49bccf3b542c21e551c",
        balance: "200"
      }

    ]
  };

  // @ts-ignore
  const state: IState = {
    hdpathPreview
  };

  it("get both chains", () => {
    const act = getByAccount(state, {type: "seed-ref", seedId: "6a05d867-1c21-4aaa-b083-cb10b38e5a33"}, 0);
    expect(act.length).toBe(2);
    expect(act[0]).toEqual(hdpathPreview.accounts[0]);
    expect(act[1]).toEqual(hdpathPreview.accounts[1]);
  });

  it("get all assets", () => {
    const act = getByAccount(state, {type: "seed-ref", seedId: "6a05d867-1c21-4aaa-b083-cb10b38e5a33"}, 1);
    expect(act.length).toBe(2);
    expect(act[0]).toEqual(hdpathPreview.accounts[2]);
    expect(act[1]).toEqual(hdpathPreview.accounts[3]);
  });


});