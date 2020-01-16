import { IApi } from '@emeraldwallet/core';
import { Dispatch } from 'react';
import {IAccountsState} from "./accounts/types";
import {IAddressBookState} from "./address-book/types";
import {IBlockchainsState} from "./blockchains/types";
import {IScreenState} from "./screen/types";
import {ISettingsState} from "./settings/types";
import {ITokensState} from "./tokens/types";
import {ITransactionState} from "./transaction/types";
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import {IAddAccountState} from "./add-account/types";

export type State = {
  addresses: IAccountsState,
  "address-book": IAddressBookState,
  blockchains: IBlockchainsState,
  conn: any,
  launcher: any,
  ledger: any,
  screen: IScreenState,
  wallet: {
    settings: ISettingsState,
    history: any,
  }
  tokens: ITokensState,
  transactions: ITransactionState,
  addAccount?: IAddAccountState
}
export type GetState = () => State;
export type Dispatched<T> = (dispatch: Dispatch<T | Dispatched<T>>, getState: GetState, api: IApi) => void;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, State, null, Action<string>>;
