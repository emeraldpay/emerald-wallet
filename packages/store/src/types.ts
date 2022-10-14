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
import { TokensState } from './tokens/types';
import { BroadcastData, SignData } from './transaction/types';
import { Triggers } from './triggers';
import { HistoryState } from './txhistory/types';

export { SignData, BroadcastData };

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
  tokens: TokensState;
}

export type GetState = () => IState;

export interface IExtraArgument {
  api: WalletApi;
  backendApi: IBackendApi;
  triggers: Triggers;
}

export type Dispatched<T> = (dispatch: Dispatch, getState: GetState, extra: IExtraArgument) => void;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, IState, null, Action<string>>;

export const DEFAULT_FEE: GasPrices = { max: 0, priority: 0 } as const;
export const FEE_KEYS = ['avgLast', 'avgTail5', 'avgMiddle'] as const;

export type GasPriceType = number | string;
export type GasPrices<T = GasPriceType> = Record<'max' | 'priority', T>;
export type PriceSort = Record<'highs' | 'priorities', BigNumber[]>;

export interface DefaultFee<T = GasPriceType> {
  max: T;
  min: T;
  std: T;
  priority_max?: string;
  priority_min?: string;
  priority_std?: string;
}

export type FeePrices<T = GasPriceType> = Record<typeof FEE_KEYS[number], T>;
