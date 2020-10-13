import produce from 'immer';
import {
  AccountDetails,
  ActionTypes,
  AccountsAction,
  IAccountsState,
  ISetBalanceAction,
  ISetLoadingAction,
  ISetTxCountAction,
  IUpdateWalletAction,
  IWalletCreatedAction,
  IWalletsLoaded, IHdAccountCreated, ISetSeedsAction
} from './types';
import {Wallet, Uuid, EntryId, AddressRefOp} from '@emeraldpay/emerald-vault-core';
import {BalanceUtxo, blockchainCodeToId} from "@emeraldwallet/core";

export const INITIAL_STATE: IAccountsState = {
  wallets: [],
  loading: true,
  details: [],
  seeds: []
};

function onLoading(state: IAccountsState, action: ISetLoadingAction): IAccountsState {
  return {
    ...state,
    loading: action.payload
  };
}

function onWalletsLoaded (state: IAccountsState, action: IWalletsLoaded): IAccountsState {
  const wallets = action.payload;
  return {
    ...state,
    wallets
  };
}

type Updater<T> = (source: T) => T;

function updateWallet(state: IAccountsState, walletId: Uuid, f: Updater<Wallet>): IAccountsState {
  const wallets = state.wallets.map((wallet) => {
    if (wallet.id === walletId) {
      return f({...wallet});
    } else {
      return wallet;
    }
  });
  return {...state, wallets};
}

function updateAccountDetails(
  state: IAccountsState, accountId: EntryId, f: Updater<AccountDetails>
): IAccountsState {

  return produce(state, (draft) => {
    let found = false;
    for (let i = 0; i < state.details.length; i++) {
      const current = draft.details[i];
      if (current.entryId === accountId) {
        found = true;
        draft.details[i] = f(current);
        break;
      }
    }
    if (!found) {
      const newAccountDetails = f({entryId: accountId});
      draft.details.push(newAccountDetails);
    }
  });
}

function onSetBalance(state: IAccountsState, action: ISetBalanceAction): IAccountsState {
  const {entryId, utxo, value} = action.payload;
  return updateAccountDetails(state, entryId, (account) => {
    let onlyNewUtxo = (utxo || []).filter((newUtxo) =>
      !(account.utxo || []).some((oldUtxo) =>
        oldUtxo.txid === newUtxo.txid && oldUtxo.vout === newUtxo.vout
      )
    );
    let copy = {...account};
    copy.balance = value;
    copy.balancePending = null;
    copy.utxo = ([] as BalanceUtxo[])
      .concat((account.utxo || []))
      .concat(onlyNewUtxo);
    return copy;
  });
}

function onWalletUpdated (state: any, action: IUpdateWalletAction) {
  const { walletId, name } = action.payload;
  return updateWallet(state, walletId, (wallet) => {
    wallet.name = name;
    return wallet;
  });
}

function onWalletCreated (state: IAccountsState, action: IWalletCreatedAction): IAccountsState {
  const { wallet } = action;
  if (state.wallets.some((w) => w.id === action.wallet.id)) {
    // already exists
    return state;
  }
  const wallets = state.wallets.concat([wallet]);
  return { ...state, wallets };
}

function onSetTxCount (state: any, action: ISetTxCountAction) {
  return updateAccountDetails(state, action.accountId, (acc) => {
    acc.txcount = action.value;
    return acc;
  });
}

function onHdAccountCreated(state: IAccountsState, action: IHdAccountCreated) {
  const {walletId, account} = action.payload;
  return updateWallet(state, walletId, (wallet) => {
    wallet.entries.push(account);
    return wallet;
  });
}

function onSedSeeds(state: IAccountsState, action: ISetSeedsAction) {
  return {
    ...state,
    seeds: action.payload
  }
}

//
// function onPendingBalance (state: any, action: PendingBalanceAction) {
//   if (action.type === ActionTypes.PENDING_BALANCE) {
//     const blockchain = blockchainByName(action.blockchain).params.code;
//     let bal;
//     if (action.to) {
//       return updateAccountDetails(state, action.to, blockchain,(acc: any) => {
//         bal = acc.get('balance').plus(new Wei(action.value));
//         return acc.set('balancePending', bal);
//       });
//     }
//     if (action.from) {
//       return updateAccountDetails(state, action.from, blockchain,(acc: any) => {
//         bal = acc.get('balance').sub(new Wei(action.value));
//         return acc.set('balancePending', bal);
//       });
//     }
//   }
//   return state;
// }

export function reducer (
  state: IAccountsState = INITIAL_STATE,
  action: AccountsAction
): IAccountsState {
  switch (action.type) {
    case ActionTypes.WALLET_UPDATED:
      return onWalletUpdated(state, action);
    case ActionTypes.SET_BALANCE:
      return onSetBalance(state, action);
    case ActionTypes.LOADING:
      return onLoading(state, action);
    case ActionTypes.SET_LIST:
      return onWalletsLoaded(state, action);
    case ActionTypes.CREATE_WALLET_SUCCESS:
      return onWalletCreated(state, action);
    case ActionTypes.SET_TXCOUNT:
      return onSetTxCount(state, action);
    case ActionTypes.HD_ACCOUNT_CREATED:
      return onHdAccountCreated(state, action);
    case ActionTypes.SET_SEEDS:
      return onSedSeeds(state, action);
    // case ActionTypes.PENDING_BALANCE:
    //   return onPendingBalance(state, action);
    default:
      return state;
  }
}
