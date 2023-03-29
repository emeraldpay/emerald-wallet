import { ActionTypes, ConnectionAction, ConnectionState, ConnectionStatus, SetStatusAction } from './types';

export const INITIAL_STATE: ConnectionState = {
  status: ConnectionStatus.CONNECTED,
};

function onSetStatus(state: ConnectionState, { payload: { status } }: SetStatusAction): ConnectionState {
  return { ...state, status };
}

export function reducer(state: ConnectionState = INITIAL_STATE, action: ConnectionAction): ConnectionState {
  switch (action.type) {
    case ActionTypes.SET_STATUS:
      return onSetStatus(state, action);
    default:
      return state;
  }
}
