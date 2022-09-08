import { IBackendApi, WalletApi } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { Action, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import * as accounts from './accounts';
import { IAccountsState } from './accounts/types';
import { IAddAccountState } from './add-account/types';
import * as addressBook from './address-book';
import { AddressBookState } from './address-book/types';
import * as application from './application';
import { IBlockchainsState } from './blockchains/types';
import * as conn from './conn/types';
import { IHDPreviewState } from './hdpath-preview/types';
import { IHWKeyState } from './hwkey/types';
import { ScreenState } from './screen/types';
import { ISettingsState } from './settings/types';
import { ITokensState } from './tokens/types';
import { ITransactionState } from './transaction/types';
import { Triggers } from './triggers';
import { HistoryState } from './txhistory/types';

export interface IState {
  [accounts.moduleName]: IAccountsState;
  [addressBook.moduleName]: AddressBookState;
  [application.moduleName]: any;
  [conn.moduleName]: any;
  addAccount?: IAddAccountState;
  blockchains: IBlockchainsState;
  hdpathPreview?: IHDPreviewState;
  history: HistoryState;
  hwkey: IHWKeyState;
  screen: ScreenState;
  settings: ISettingsState;
  tokens: ITokensState;
  transaction: ITransactionState;
}

export type GetState = () => IState;

export interface IExtraArgument {
  api: WalletApi;
  backendApi: IBackendApi;
  triggers: Triggers;
}

export type Dispatched<T> = (dispatch: Dispatch, getState: GetState, extra: IExtraArgument) => void;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, IState, null, Action<string>>;

export type GasPriceType = number | string;
export type GasPrices<T = GasPriceType> = Record<'expect' | 'max' | 'priority', T>;
export type PriceSort = Record<'expects' | 'highs' | 'priorities', BigNumber[]>;

export const DEFAULT_FEE: GasPrices = { expect: 0, max: 0, priority: 0 } as const;
export const FEE_KEYS = ['avgLast', 'avgTail5', 'avgMiddle'] as const;

export type FeePrices = Record<typeof FEE_KEYS[number], GasPrices>;
