import { combineReducers } from 'redux';
import {
  IState,
  accounts,
  addAccount,
  addressBook,
  application,
  blockchains,
  connection,
  hdpathPreview,
  hwkey,
  screen,
  settings,
  tokens,
  txhistory,
} from './';

const root = combineReducers<IState>({
  [accounts.moduleName]: accounts.reducer,
  [addressBook.moduleName]: addressBook.reducer,
  [application.moduleName]: application.reducer,
  [connection.moduleName]: connection.reducer,
  [screen.moduleName]: screen.reducer,
  [tokens.moduleName]: tokens.reducer,
  addAccount: addAccount.reducer,
  blockchains: blockchains.reducer,
  hdpathPreview: hdpathPreview.reducer,
  history: txhistory.reducer,
  hwkey: hwkey.reducer,
  settings: settings.reducer,
});

export default root;
