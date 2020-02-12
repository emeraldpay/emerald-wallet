import { IApi } from '@emeraldwallet/core';
import { Dispatch } from 'react';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as accounts from './accounts';
import { IAccountsState } from './accounts/types';
import { IAddAccountState } from './add-account/types';
import * as addressBook from './address-book';
import { IAddressBookState } from './address-book/types';
import { IBlockchainsState } from './blockchains/types';
import { IScreenState } from './screen/types';
import { ISettingsState } from './settings/types';
import { ITokensState } from './tokens/types';
import { ITransactionState } from './transaction/types';
import * as application from './application';

export interface IState {
  [application.moduleName]: any;
  [accounts.moduleName]: IAccountsState;
  [addressBook.moduleName]: IAddressBookState;
  blockchains: IBlockchainsState;
  conn: any;
  ledger: any;
  screen: IScreenState;
  settings: ISettingsState;
  history: any;
  tokens: ITokensState;
  transaction: ITransactionState;
  addAccount?: IAddAccountState;
}
export type GetState = () => IState;
export type Dispatched<T> = (dispatch: Dispatch<T | Dispatched<T>>, getState: GetState, api: IApi) => void;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, IState, null, Action<string>>;
