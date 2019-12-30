import { fromJS } from 'immutable';
import { ActionTypes, ConnAction, ConnectionStatus, ISetStatusAction } from './types';

export const initialState = fromJS({
  status: ConnectionStatus.CONNECTED
});

function onSetStatus (state: any, action: ISetStatusAction) {
  if (action.type === ActionTypes.SET_STATUS) {
    return state.set('status', action.payload.status);
  }
  return state;
}

export function reducer (state: any, action: ConnAction): any {
  state = state || initialState;
  state = onSetStatus(state, action);
  return state;
}
