import { combineReducers } from 'redux';
import history from './history';
// import screen from './screen';
import settings from './settings';

const reducers = {
  history: history.reducer,
  // screen: screen.reducer,
  settings: settings.reducer,
};

export default combineReducers(reducers);
