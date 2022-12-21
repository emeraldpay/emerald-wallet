import { checkLedger } from './actions';
import { isWatching } from './selectors';
import { TriggerProcess, TriggerState, TriggerStatus, Triggers } from '../triggers';
import { IState } from '../types';

const whenWatch: TriggerState = (state) => `${isWatching(state.hwkey)}`;

const executeCheckLedgerRepeat: TriggerProcess = (state, dispatch) => {
  if (isWatching(state.hwkey)) {
    dispatch(checkLedger());

    return TriggerStatus.CONTINUE;
  }

  return TriggerStatus.STOP;
};

let connectHandlers: ((state: IState) => void)[] = [];

export function onConnect(handler: (state: IState) => void): void {
  connectHandlers.push(handler);
}

const executeConnectHandlers: TriggerProcess = (state) => {
  if (connectHandlers.length > 0 && state.hwkey.ledger.connected) {
    const handlers = connectHandlers;

    connectHandlers = [];

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
  triggers.add(whenWatch, (state, dispatch) => {
    if (isWatching(state.hwkey)) {
      dispatch(checkLedger());

      triggers.schedule(1500, executeCheckLedgerRepeat);
    }

    return TriggerStatus.CONTINUE;
  });

  triggers.schedule(1000, executeConnectHandlers);
}
