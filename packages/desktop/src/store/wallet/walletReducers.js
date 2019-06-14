import { combineReducers } from 'redux';
import history from './history';
import settings from './settings';

const reducers = {
  history: history.reducer,
  settings: settings.reducer,
};

export default combineReducers(reducers);
