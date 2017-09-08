import { combineReducers } from 'redux';
import historyReducers from './history/historyReducers';

const reducers = {
    history: historyReducers,
};

export default combineReducers(reducers);
