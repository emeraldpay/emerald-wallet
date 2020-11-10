import {TriggerProcess, Triggers, TriggerState, TriggerStatus} from "../triggers";
import {BlockchainCode, ledgerByBlockchain} from "@emeraldwallet/core";
import {loadAddresses} from "./actions";
import {isHardwareSeed} from "../accounts/selectors";

const onApp: TriggerState = (state) => state.hwkey.ledger.app || undefined;

const executeOnApp: TriggerProcess = (state, dispatch) => {
  const preview = state.hdpathPreview;
  if (preview && preview.display.seed &&
    isHardwareSeed(state, preview.display.seed) &&
    state.hwkey.ledger.connected && state.hwkey.ledger.app) {

    const seed = preview.display.seed!;
    const app = state.hwkey.ledger.app;
    const current = ledgerByBlockchain[app];

    preview.display.entries.forEach((entry) => {
      if (entry.blockchain == current) {
        dispatch(loadAddresses(seed, preview.display.account, current))
      }
    })
  }
  return TriggerStatus.CONTINUE;
}

export function run(triggers: Triggers) {
  triggers.add(onApp, executeOnApp);
}