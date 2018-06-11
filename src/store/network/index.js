import * as selectors from './selectors';
import * as actions from './networkActions';
import reducer from './networkReducers';

import screen from '../wallet/screen';

const wrapActionWithErrorHandling = (method) => {
  return (...props) => {
    return (dispatch, getState, api) => {
      const returnVal = method(...props, dispatch, getState, api);

      if (returnVal.catch) {
        returnVal.catch((e) => dispatch(screen.actions.showError(e)));
      }

      return returnVal;
    };
  };
};

const wrappedActions = {};
Object.keys(actions).forEach((key) => {
  const method = actions[key];
  wrappedActions[key] = wrapActionWithErrorHandling(method);
});


export default { actions: wrappedActions, selectors, reducer };
