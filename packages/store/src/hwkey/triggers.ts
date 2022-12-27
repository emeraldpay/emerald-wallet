import { checkLedger } from './actions';
import { isWatching } from './selectors';
import { TriggerProcess, TriggerState, TriggerStatus, Triggers } from '../triggers';
import { IState } from '../types';

const shouldWatch: TriggerState = (state) => `${isWatching(state.hwkey)}`;

const executeCheckLedger: TriggerProcess = (state, dispatch) => {
  if (isWatching(state.hwkey)) {
    dispatch(checkLedger());

    return TriggerStatus.CONTINUE;
  }

  return TriggerStatus.STOP;
};

let connectionHandlers: ((state: IState) => void)[] = [];

export function onConnect(handler: (state: IState) => void): void {
  connectionHandlers.push(handler);
}

const executeConnectionHandlers: TriggerProcess = (state) => {
  if (connectionHandlers.length > 0 && state.hwkey.ledger.connected) {
    const handlers = connectionHandlers;

    connectionHandlers = [];

    handlers.forEach((handler) => {
      try {
        handler(state);
      } catch (exception) {
        console.warn('Error during handler call', exception);
      }
    });
  }

  return TriggerStatus.CONTINUE;
};

export function run(triggers: Triggers): void {
  triggers.add(shouldWatch, (state, dispatch) => {
    if (isWatching(state.hwkey)) {
      dispatch(checkLedger());

      triggers.schedule(1500, executeCheckLedger);
    }

    return TriggerStatus.CONTINUE;
  });

  triggers.schedule(1000, executeConnectionHandlers);
}
