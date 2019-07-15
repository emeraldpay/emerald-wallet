import { combineReducers } from 'redux';
import { txhistory } from '@emeraldwallet/store';
import settings from './settings';

const reducers = {
  history: txhistory.reducer,
  settings: settings.reducer,
};

export default combineReducers(reducers);
