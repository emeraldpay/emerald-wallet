import {TriggerState, Triggers, TriggerProcess, TriggerStatus} from "../triggers";
import {checkLedger} from "./actions";
import {isWatching} from "./selectors";

const whenWatch: TriggerState = (state) => `${isWatching(state.hwkey)}`;

const executeCheckLedgerRepeat: TriggerProcess = (state, dispatch) => {
  if (isWatching(state.hwkey)) {
    dispatch(checkLedger());
    return TriggerStatus.CONTINUE;
  } else {
    return TriggerStatus.STOP;
  }
}

let connectHandlers: (() => void)[] = []

export function onConnect(handler: () => void) {
  connectHandlers.push(handler);
}

const executeConnectHandlers: TriggerProcess = (state, dispatch) => {
  if (connectHandlers.length > 0 && state.hwkey.ledger.connected) {
    const handlers = connectHandlers;
    connectHandlers = [];
    handlers.forEach((h) => {
      try {
        h();
      } catch (e) {
        console.warn("Error during handler call", e)
      }
    })
  }
  return TriggerStatus.CONTINUE;
}

export function run(triggers: Triggers) {
  triggers.add(whenWatch, (state, dispatch) => {
    if (isWatching(state.hwkey)) {
      console.log("Start watching HW Keys");
      dispatch(checkLedger());
      triggers.schedule(1500, executeCheckLedgerRepeat);
    }
    return TriggerStatus.CONTINUE;
  });
  triggers.schedule(1000, executeConnectHandlers);
}