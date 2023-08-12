import { combineReducers } from 'redux';
import {
  IState,
  accounts,
  addAccount,
  addressBook,
  allowances,
  application,
  blockchains,
  connection,
  hdpathPreview,
  screen,
  settings,
  tokens,
  txhistory,
} from './';

export const rootReducer = combineReducers<IState>({
  [accounts.moduleName]: accounts.reducer,
  [addressBook.moduleName]: addressBook.reducer,
  [allowances.moduleName]: allowances.reducer,
  [application.moduleName]: application.reducer,
  [connection.moduleName]: connection.reducer,
  [screen.moduleName]: screen.reducer,
  [tokens.moduleName]: tokens.reducer,
  addAccount: addAccount.reducer,
  blockchains: blockchains.reducer,
  hdpathPreview: hdpathPreview.reducer,
  history: txhistory.reducer,
  settings: settings.reducer,
});
