import { combineReducers } from 'redux';
import {
  accounts,
  addAccount,
  addressBook,
  application,
  blockchains,
  connection,
  IState,
  hwkey,
  screen,
  settings,
  tokens,
  transaction,
  txhistory,
  hdpathPreview
} from './';

const root = combineReducers<IState>({
  history: txhistory.reducer,
  settings: settings.reducer,
  [addressBook.moduleName]: addressBook.reducer,
  [tokens.moduleName]: tokens.reducer,
  [application.moduleName]: application.reducer,
  hwkey: hwkey.reducer,
  [accounts.moduleName]: accounts.reducer,
  blockchains: blockchains.reducer,
  [screen.moduleName]: screen.reducer,
  [connection.moduleName]: connection.reducer,
  addAccount: addAccount.reducer,
  [transaction.moduleName]: transaction.reducer,
  hdpathPreview: hdpathPreview.reducer
});

export default root;
