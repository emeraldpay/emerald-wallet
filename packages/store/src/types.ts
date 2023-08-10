import { BackendApi, WalletApi } from '@emeraldwallet/core';
import { Action, AnyAction, Dispatch } from 'redux';
import { AccountsState, moduleName as accountsModule } from './accounts/types';
import { IAddAccountState } from './add-account/types';
import { AddressBookState, moduleName as addressBookModule } from './address-book/types';
import { AllowanceState, moduleName as allowanceModule } from './allowances/types';
import { ApplicationState, moduleName as applicationModule } from './application/types';
import { BlockchainsState, moduleName as blockchainsModule } from './blockchains/types';
import { ConnectionState, moduleName as connectionModule } from './connection/types';
import { IHDPreviewState } from './hdpath-preview/types';
import { ScreenState } from './screen/types';
import { SettingsState } from './settings/types';
import { TokensState, moduleName as tokensModule } from './tokens/types';
import { HistoryState } from './txhistory/types';

export interface IState {
  [accountsModule]: AccountsState;
  [addressBookModule]: AddressBookState;
  [allowanceModule]: AllowanceState;
  [applicationModule]: ApplicationState;
  [blockchainsModule]: BlockchainsState;
  [connectionModule]: ConnectionState;
  [tokensModule]: TokensState;
  addAccount?: IAddAccountState;
  hdpathPreview?: IHDPreviewState;
  history: HistoryState;
  screen: ScreenState;
  settings: SettingsState;
}

export type GetState = () => IState;

export interface IExtraArgument {
  api: WalletApi;
  backendApi: BackendApi;
}

export interface Dispatcher<A extends Action = AnyAction> extends Dispatch<A> {
  <R>(dispatched: Dispatched<R, A>): R | Promise<R>;
}

export type Dispatched<R = void, A extends Action = AnyAction> = (
  dispatch: Dispatcher<A>,
  getState: GetState,
  extra: IExtraArgument,
) => R | Promise<R>;
