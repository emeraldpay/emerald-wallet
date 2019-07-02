import { fromJS, Map } from 'immutable';
import { Wei } from '@emeraldplatform/eth';
import {
  IAddressesState,
  AddressesAction,
  LoadingAction,
  ActionTypes,
  SetListAction,
  SetBalanceAction,
  UpdateAddressAction,
  AddAccountAction, SetHDPath,
} from "./types";

export const INITIAL_STATE = fromJS({
  addresses: [],
  loading: true,
});

const initialAccount = Map({
  id: null,
  hardware: false,
  hdpath: null,
  balance: null,
  balancePending: null,
  txcount: null,
  name: null,
  description: null,
  hidden: false,
  blockchain: null,
});

function onLoading(state: any, action: LoadingAction): any {
  return state.set('loading', true);
}


function onSetList(state: any, action: SetListAction) {
  const existingAccounts = state.get('addresses');
  const getExisting = (id: string) => {
    const pos = existingAccounts.findKey((x: any) => x.get('id') === id);
    if (pos >= 0) {
      return existingAccounts.get(pos);
    }
    return initialAccount;
  };
  const addresses = action.payload;

  const updatedList = fromJS(addresses).map((acc: any) => fromJS({
    name: acc.get('name'),
    description: acc.get('description'),
    id: acc.get('address'),
    hardware: acc.get('hardware'),
    hdpath: acc.get('hdpath'),
    hidden: acc.get('hidden'),
    blockchain: acc.get('blockchain'),
  })).map((acc: any) => getExisting(acc.get('id')).merge(acc));
  return state
    .set('addresses', updatedList)
    .set('loading', false);
}

function updateAccount(state: any, id: string, f: any) {
  return state.update('addresses', (accounts: any) => {
    const pos = accounts.findKey((acc: any) => acc.get('id') === id);
    if (pos >= 0) {
      return accounts.update(pos, f);
    }
    return accounts;
  });
}


function onSetBalance(state: any, action: SetBalanceAction) {
  const { accountId, value } = action.payload;
  return updateAccount(state, accountId, (acc: any) => {
    // Update balance only if it's changed
    const newBalance = new Wei(value);
    const currentBalance = acc.get('balance');
    if (currentBalance && currentBalance.equals(newBalance)) {
      return acc.set('balancePending', null);
    }
    return acc
      .set('balance', newBalance)
      .set('balancePending', null);
  });
}

function onUpdateAccount(state: any, action: UpdateAddressAction) {
  const { address, name, description } = action.payload;
  return updateAccount(state, address, (acc: any) => acc
    .set('name', name)
    .set('description', description));
}

function onAddAccount(state: any, action: AddAccountAction) {
  const {accountId, name, description, blockchain} = action;
  return state.update('addresses', (accounts: any) => {
    const pos = accounts.findKey((acc: any) => acc.get('id') === accountId && acc.get('blockchain') === blockchain);
    if (pos >= 0) {
      return accounts;
    }
    const values = fromJS({
      id: accountId, name, description, blockchain,
    });
    const newAccount = initialAccount.merge(values);
    return accounts.push(newAccount);
  });
}

function onSetHdPath(state: any, action: SetHDPath) {
  if (action.type === ActionTypes.SET_HD_PATH) {
    return updateAccount(state, action.accountId, (acc: any) => acc.set('hdpath', action.hdpath));
  }
  return state;
}

export function reducer(
  state: any = INITIAL_STATE,
  action: AddressesAction
): IAddressesState {
  switch(action.type) {
    case ActionTypes.UPDATE_ACCOUNT:
      return onUpdateAccount(state, action);
    case ActionTypes.SET_BALANCE:
      return onSetBalance(state, action);
    case ActionTypes.LOADING:
      return onLoading(state, action);
    case ActionTypes.SET_LIST:
      return onSetList(state, action);
    case ActionTypes.ADD_ACCOUNT:
      return onAddAccount(state, action);
    case ActionTypes.SET_HD_PATH:
      return onSetHdPath(state, action);
    default:
      return state;
  }
}
