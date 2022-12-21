import { BackendApi, WalletApi } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { Action, AnyAction, Dispatch } from 'redux';
import { IAccountsState, moduleName as accountsModule } from './accounts/types';
import { IAddAccountState } from './add-account/types';
import { AddressBookState, moduleName as addressBookModule } from './address-book/types';
import { ApplicationState, moduleName as applicationModule } from './application/types';
import { BlockchainsState, moduleName as blockchainsModule } from './blockchains/types';
import { IConnState, moduleName as connModule } from './conn/types';
import { IHDPreviewState } from './hdpath-preview/types';
import { IHWKeyState } from './hwkey/types';
import { ScreenState } from './screen/types';
import { SettingsState } from './settings/types';
import { TokensState, moduleName as tokensModule } from './tokens/types';
import { BroadcastData, SignData } from './transaction/types';
import { Triggers } from './triggers';
import { HistoryState } from './txhistory/types';

export { SignData, BroadcastData };

export interface IState {
  [accountsModule]: IAccountsState;
  [addressBookModule]: AddressBookState;
  [applicationModule]: ApplicationState;
  [blockchainsModule]: BlockchainsState;
  [connModule]: IConnState;
  [tokensModule]: TokensState;
  addAccount?: IAddAccountState;
  hdpathPreview?: IHDPreviewState;
  history: HistoryState;
  hwkey: IHWKeyState;
  screen: ScreenState;
  settings: SettingsState;
}

export type GetState = () => IState;

export interface IExtraArgument {
  api: WalletApi;
  backendApi: BackendApi;
  triggers: Triggers;
}

export interface Dispatcher<A extends Action = AnyAction> extends Dispatch<A> {
  <R>(dispatched: Dispatched<R, A>): R | Promise<R>;
}

export type Dispatched<R = void, A extends Action = AnyAction> = (
  dispatch: Dispatcher<A>,
  getState: GetState,
  extra: IExtraArgument,
) => R | Promise<R>;

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
