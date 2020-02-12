import { combineReducers } from 'redux';
import {
  accounts,
  addAccount,
  addressBook,
  application,
  blockchains,
  connection, IState,
  ledger,
  screen,
  settings,
  tokens,
  txhistory,
  transaction
} from './';

const root = combineReducers<IState>({
  history: txhistory.reducer,
  settings: settings.reducer,
  [addressBook.moduleName]: addressBook.reducer,
  [tokens.moduleName]: tokens.reducer,
  [application.moduleName]: application.reducer,
  ledger: ledger.reducer,
  [accounts.moduleName]: accounts.reducer,
  blockchains: blockchains.reducer,
  screen: screen.reducer,
  conn: connection.reducer,
  addAccount: addAccount.reducer,
  [transaction.moduleName]: transaction.reducer
});

export default root;
