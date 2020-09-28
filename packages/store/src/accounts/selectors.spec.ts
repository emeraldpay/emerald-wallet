import {BlockchainCode, CurrencyAmount} from '@emeraldwallet/core';
import {IState} from '../types';
import {allAsArray, allBalances, balanceByChain, aggregateByAsset, withFiatConversion} from './selectors';
import {moduleName} from './types';
import {Satoshi, Wei, WeiEtc} from '@emeraldpay/bigamount-crypto';
import {ISettingsState} from "../settings/types";

const NO_ADDRESS = {type: "single", value: ""};

describe('allAsArray', () => {
  const state = {
    [moduleName]: {
      wallets: [{
        id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
        accounts: []
      }]
    }
  };
  it('should returns array', () => {
    // @ts-ignore
    const result = allAsArray(state);
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual('f692dcb6-74ea-4583-8ad3-fd13bb6c38ee');
  });
});

describe('selectTotalBalance', () => {
  it('returns zero if no accounts', () => {
    const state = {
      [moduleName]: {
        wallets: []
      }
    };

    // @ts-ignore
    const total = balanceByChain(state, BlockchainCode.ETH);
    expect(total).toEqual(Wei.ZERO);
  });

  it('returns account balance if there is only one', () => {
    const state = {
      [moduleName]: {
        wallets: [{
          id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
          entries: [
            {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', blockchain: 101, address: NO_ADDRESS}
          ]
        }],
        details: [
          {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', balance: new WeiEtc(1234, "ETHER").encode()}
        ]
      }
    } as IState;

    const total = balanceByChain(state, BlockchainCode.ETC);
    expect(WeiEtc.is(total)).toBeTruthy();
    expect((total as WeiEtc).toEther()).toBe(1234);
    expect(total.equals(new WeiEtc(1234, "ETHER"))).toBeTruthy();
  });

  it('returns sum of balances for one wallet', () => {
    const state = {
      [moduleName]: {
        wallets: [{
          id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
          entries: [
            {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', blockchain: 100, address: NO_ADDRESS},
            {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', blockchain: 100, address: NO_ADDRESS},
            {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', blockchain: 101, address: NO_ADDRESS}
          ]
        }],
        details: [
          {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', balance: new Wei(1234).encode()},
          {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', balance: new Wei(11).encode()},
          {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', balance: new Wei(52).encode()}
        ]
      }
    } as IState;

    const total = balanceByChain(state, BlockchainCode.ETH);
    expect(total.number.toFixed()).toEqual('1245');
  });

  it('returns sum of balances for two wallets', () => {
    const state = {
      [moduleName]: {
        wallets: [
          {
            id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
            entries: [
              {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', blockchain: 100, address: NO_ADDRESS},
              {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', blockchain: 100, address: NO_ADDRESS},
              {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', blockchain: 101, address: NO_ADDRESS}
            ]
          },
          {
            id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c',
            entries: [
              {id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-0', blockchain: 100, address: NO_ADDRESS},
              {id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-1', blockchain: 101, address: NO_ADDRESS}
            ]
          }
        ],
        details: [
          {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', balance: new Wei(1234).encode()},
          {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', balance: new Wei(11).encode()},
          {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', balance: new Wei(52).encode()},
          {entryId: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-0', balance: new Wei(200).encode()},
          {entryId: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-1', balance: new Wei(302).encode()}
        ]
      }
    } as IState;

    const total = balanceByChain(state, BlockchainCode.ETH);
    expect(total.number.toFixed()).toEqual('1445');
  });

  it('convert to fiat', () => {
    const state = {
      [moduleName]: {
        wallets: [
          {
            id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
            entries: [
              {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', blockchain: 100, address: NO_ADDRESS},
              {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', blockchain: 100, address: NO_ADDRESS},
              {id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', blockchain: 101, address: NO_ADDRESS}
            ]
          },
          {
            id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c',
            entries: [
              {id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-0', blockchain: 1, address: NO_ADDRESS},
              {id: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-1', blockchain: 100, address: NO_ADDRESS}
            ]
          }
        ],
        details: [
          {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-0', balance: new Wei(1.2, "ETHER").encode()},
          {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-1', balance: new Wei(1.1, "ETHER").encode()},
          {entryId: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee-2', balance: new WeiEtc(52, "ETHER").encode()},
          {
            entryId: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-0', balance: undefined,
            utxo: [
              {value: new Satoshi(0.5, "BTC").encode()}
            ]
          },
          {entryId: 'c0659f31-1932-4006-bc4c-dbbab27fc25c-1', balance: new Wei(3, "ETHER").encode()}
        ]
      },
      settings: {
        localeCurrency: "USD",
        rates: {
          "BTC": "12300",
          "ETH": "256",
          "ETC": "4.56"
        }
      } as unknown as ISettingsState
    } as IState;

    const assets = allBalances(state);

    // wallet 1 - ETH + ETC, wallet 2 - BTC + ETH
    expect(assets.length).toBe(4);

    const aggregatedAssets = aggregateByAsset(assets);
    // ETH + ETC + BTC
    expect(aggregatedAssets.length).toBe(3);

    const prices = withFiatConversion(state, aggregatedAssets);
    expect(prices.length).toBe(3);

    // ETH = (1.2 + 1.1 + 3) * 256
    expect(prices[0].converted.balance.toString()).toBe(CurrencyAmount.create(1356.8, "USD").toString());
    // ETC = 52 * 4.56
    expect(prices[1].converted.balance.toString()).toBe(CurrencyAmount.create(237.12, "USD").toString());
    // BTC = (0.5) * 12300
    expect(prices[2].converted.balance.toString()).toBe(CurrencyAmount.create(6150, "USD").toString());
  });

});
