import { ActionTypes, ISetStatusAction } from './types';

export function setConnStatus (status: string): ISetStatusAction {
  return {
    type: ActionTypes.SET_STATUS,
    payload: {
      status
    }
  };
}
