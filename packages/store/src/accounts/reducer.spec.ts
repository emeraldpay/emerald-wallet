import { INITIAL_STATE, reducer } from './reducer';
import { ActionTypes, IAccountsState } from './types';

describe('accounts reducer', () => {
  it('handles Actions.LOADING', () => {
    const state = reducer(undefined, { type: ActionTypes.LOADING, payload: true });
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
        accounts: []
      }]
    });
    // assert
    expect(state.wallets.length).toEqual(1);
    expect(state.wallets[0].id).toEqual('f692dcb6-74ea-4583-8ad3-fd13bb6c38ee');

    state = reducer(state, {
      type: ActionTypes.SET_LIST,
      payload: [{
        id: 'c35d05ba-d6bb-40b1-9553-383f414a97e5',
        accounts: []
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
        accounts: []
      }
    });
    expect(state.wallets.length).toEqual(1);
    expect(state.wallets[0].id).toEqual('c35d05ba-d6bb-40b1-9553-383f414a97e5');

    // add again
    state = reducer(state, {
      type: ActionTypes.CREATE_WALLET_SUCCESS,
      wallet: {
        id: 'c35d05ba-d6bb-40b1-9553-383f414a97e5',
        accounts: []
      }
    });
    expect(state.wallets.length).toEqual(1);
    expect(state.wallets[0].id).toEqual('c35d05ba-d6bb-40b1-9553-383f414a97e5');

    // add different wallet
    state = reducer(state, {
      type: ActionTypes.CREATE_WALLET_SUCCESS,
      wallet: {
        id: '2d9fde4e-ce00-4b58-af68-15c211604529',
        accounts: []
      }
    });
    expect(state.wallets.length).toEqual(2);
    expect(state.wallets[0].id).toEqual('c35d05ba-d6bb-40b1-9553-383f414a97e5');
    expect(state.wallets[1].id).toEqual('2d9fde4e-ce00-4b58-af68-15c211604529');
  });

});
