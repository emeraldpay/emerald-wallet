import { combineReducers } from 'redux';
import historyReducers from './history/historyReducers';
import screenReducers from './screen/screenReducers';
import settingsReducers from './settings/settingsReducers';

const reducers = {
    history: historyReducers,
    screen: screenReducers,
    settings: settingsReducers,
};

export default combineReducers(reducers);
