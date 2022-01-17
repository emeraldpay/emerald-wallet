import {ActionTypes, IHWKeyState, IWatchAction, IHWKeyAction, ISetLedgerApp} from './types';

export const INITIAL_STATE: IHWKeyState = {
  watch: false,
  ledger: {
    connected: false,
    app: null
  }
};

function onWatch(state: IHWKeyState, action: IWatchAction): IHWKeyState {
  return {
    ...state,
    watch: action.value,
  }
}

function onSetLedger(state: IHWKeyState, action: ISetLedgerApp): IHWKeyState {
  let app = action.app;

  // vault lib may return it because of a bug
  // TODO: remove the workaround after upgrading to vault 0.7.x
  // @ts-ignore
  if (app == 'bitcoin-test') {
    app = "bitcoin-testnet";
  }

  return {
    ...state,
    ledger: {
      ...state.ledger,
      connected: action.connected,
      app
    }
  }
}

export function reducer(
  state: IHWKeyState = INITIAL_STATE,
  action: IHWKeyAction
): IHWKeyState {
  switch (action.type) {
    case ActionTypes.WATCH:
      return onWatch(state, action);
    case ActionTypes.SET_LEDGER:
      return onSetLedger(state, action);
    default:
      return state;
  }
}