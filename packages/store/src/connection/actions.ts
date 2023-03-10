import { ActionTypes, SetStatusAction } from './types';

export function setConnectionStatus(status: string): SetStatusAction {
  return {
    type: ActionTypes.SET_STATUS,
    payload: { status },
  };
}
