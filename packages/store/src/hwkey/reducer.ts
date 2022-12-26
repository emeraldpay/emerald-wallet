import { ActionTypes, IHWKeyAction, HWKeyState, SetLedgerApp, WatchAction } from './types';

export const INITIAL_STATE: HWKeyState = {
  watch: false,
  ledger: {
    connected: false,
    app: null,
  },
};

function onSetLedger(state: HWKeyState, action: SetLedgerApp): HWKeyState {
  const { app, connected } = action;

  return {
    ...state,
    ledger: { app, connected },
  };
}

function onWatch(state: HWKeyState, action: WatchAction): HWKeyState {
  return {
    ...state,
    watch: action.value,
  };
}

export function reducer(state: HWKeyState = INITIAL_STATE, action: IHWKeyAction): HWKeyState {
  switch (action.type) {
    case ActionTypes.SET_LEDGER:
      return onSetLedger(state, action);
    case ActionTypes.WATCH:
      return onWatch(state, action);
    default:
      return state;
  }
}
