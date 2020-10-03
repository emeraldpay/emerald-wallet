import {INITIAL_STATE, reducer} from './reducer';
import {ActionTypes, IAccountsState} from './types';
import {Wallet} from '@emeraldpay/emerald-vault-core';

describe('accounts reducer', () => {
  it('handles Actions.LOADING', () => {
    const state = reducer(undefined, {type: ActionTypes.LOADING, payload: true});
    expect(state).toEqual({
      ...INITIAL_STATE,
      loading: true
    });
  });

  it('SET_LIST should store addresses correctly', () => {
    // do
    let state: IAccountsState = reducer(undefined, {
      type: ActionTypes.SET_LIST,
      payload: [{
        id: 'f692dcb6-74ea-4583-8ad3-fd13bb6c38ee',
        entries: [],
        createdAt: new Date()
      }]
    });
    // assert
    expect(state.wallets.length).toEqual(1);
    expect(state.wallets[0].id).toEqual('f692dcb6-74ea-4583-8ad3-fd13bb6c38ee');

    state = reducer(state, {
      type: ActionTypes.SET_LIST,
      payload: [{
        id: 'c35d05ba-d6bb-40b1-9553-383f414a97e5',
        entries: [],
        createdAt: new Date()
      }]
    });
    expect(state.wallets.length).toEqual(1);
    expect(state.wallets[0].id).toEqual('c35d05ba-d6bb-40b1-9553-383f414a97e5');
  });

  it('ADD_ACCOUNT should add only non existent account', () => {
    let state: IAccountsState = reducer(undefined, { type: ActionTypes.LOADING, payload: true });
    expect(state.wallets.length).toEqual(0);
    state = reducer(state, {
      type: ActionTypes.CREATE_WALLET_SUCCESS,
      wallet: {
        id: 'c35d05ba-d6bb-40b1-9553-383f414a97e5',
        entries: [],
        createdAt: new Date()
      }
    });
    expect(state.wallets.length).toEqual(1);
    expect(state.wallets[0].id).toEqual('c35d05ba-d6bb-40b1-9553-383f414a97e5');

    // add again
    state = reducer(state, {
      type: ActionTypes.CREATE_WALLET_SUCCESS,
      wallet: {
        id: 'c35d05ba-d6bb-40b1-9553-383f414a97e5',
        entries: [],
        createdAt: new Date()
      }
    });
    expect(state.wallets.length).toEqual(1);
    expect(state.wallets[0].id).toEqual('c35d05ba-d6bb-40b1-9553-383f414a97e5');

    // add different wallet
    state = reducer(state, {
      type: ActionTypes.CREATE_WALLET_SUCCESS,
      wallet: {
        id: '2d9fde4e-ce00-4b58-af68-15c211604529',
        entries: [],
        createdAt: new Date()
      }
    });
    expect(state.wallets.length).toEqual(2);
    expect(state.wallets[0].id).toEqual('c35d05ba-d6bb-40b1-9553-383f414a97e5');
    expect(state.wallets[1].id).toEqual('2d9fde4e-ce00-4b58-af68-15c211604529');
  });

  it('SET_BALANCE updates utxo', () => {
    let state: IAccountsState = reducer(undefined,
      {
        type: ActionTypes.SET_BALANCE,
        payload: {
          entryId: "c35d05ba-d6bb-40b1-9553-383f414a97e5-1",
          value: "",
          utxo: [
            {
              txid: "0d41a0d6b50f6ffb5e04ace6622086ef31eced444201545e845410b04af0737c",
              vout: 0,
              value: "100/SAT",
              address: "tb1qepcagv9wkp04ygq3ud33qrkk6482ulhkegc333"
            }
          ]
        }
      }
    );

    expect(state.details[0].utxo).toEqual([
      {
        txid: "0d41a0d6b50f6ffb5e04ace6622086ef31eced444201545e845410b04af0737c",
        vout: 0,
        value: "100/SAT",
        address: "tb1qepcagv9wkp04ygq3ud33qrkk6482ulhkegc333"
      }
    ]);
  });

  it('SET_BALANCE doesnt duplicate utxo', () => {
    let state: IAccountsState = reducer(undefined,
      {
        type: ActionTypes.SET_BALANCE,
        payload: {
          entryId: "c35d05ba-d6bb-40b1-9553-383f414a97e5-1",
          value: "",
          utxo: [
            {
              txid: "0d41a0d6b50f6ffb5e04ace6622086ef31eced444201545e845410b04af0737c",
              vout: 0,
              value: "100/SAT",
              address: "tb1qepcagv9wkp04ygq3ud33qrkk6482ulhkegc333"
            }
          ]
        }
      }
    );
    state = reducer(state,
      {
        type: ActionTypes.SET_BALANCE,
        payload: {
          entryId: "c35d05ba-d6bb-40b1-9553-383f414a97e5-1",
          value: "",
          utxo: [
            {
              txid: "0d41a0d6b50f6ffb5e04ace6622086ef31eced444201545e845410b04af0737c",
              vout: 0,
              value: "100/SAT",
              address: "tb1qepcagv9wkp04ygq3ud33qrkk6482ulhkegc333"
            }
          ]
        }
      }
    );

    expect(state.details[0].utxo).toEqual([
      {
        txid: "0d41a0d6b50f6ffb5e04ace6622086ef31eced444201545e845410b04af0737c",
        vout: 0,
        value: "100/SAT",
        address: "tb1qepcagv9wkp04ygq3ud33qrkk6482ulhkegc333"
      }
    ]);
  });

  it('SET_BALANCE add new utxo', () => {
    let state: IAccountsState = reducer(undefined,
      {
        type: ActionTypes.SET_BALANCE,
        payload: {
          entryId: "c35d05ba-d6bb-40b1-9553-383f414a97e5-1",
          value: "",
          utxo: [
            {
              txid: "0d41a0d6b50f6ffb5e04ace6622086ef31eced444201545e845410b04af0737c",
              vout: 0,
              value: "100/SAT",
              address: "tb1qepcagv9wkp04ygq3ud33qrkk6482ulhkegc333"
            }
          ]
        }
      }
    );
    state = reducer(state,
      {
        type: ActionTypes.SET_BALANCE,
        payload: {
          entryId: "c35d05ba-d6bb-40b1-9553-383f414a97e5-1",
          value: "",
          utxo: [
            {
              txid: "6ef31eced444201545e845410b04af0737c0d41a0d6b50f6ffb5e04ace662208",
              vout: 0,
              value: "200/SAT",
              address: "tb1qepcagv9wkp04ygq3ud33qrkk6482ulhkegc333"
            }
          ]
        }
      }
    );

    expect(state.details[0].utxo).toEqual([
      {
        txid: "0d41a0d6b50f6ffb5e04ace6622086ef31eced444201545e845410b04af0737c",
        vout: 0,
        value: "100/SAT",
        address: "tb1qepcagv9wkp04ygq3ud33qrkk6482ulhkegc333"
      },
      {
        txid: "6ef31eced444201545e845410b04af0737c0d41a0d6b50f6ffb5e04ace662208",
        vout: 0,
        value: "200/SAT",
        address: "tb1qepcagv9wkp04ygq3ud33qrkk6482ulhkegc333"
      }
    ]);
  });
});
