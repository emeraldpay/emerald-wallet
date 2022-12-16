import { ledgerByBlockchain } from '@emeraldwallet/core';
import { loadAddresses } from './actions';
import { isHardwareSeed } from '../accounts/selectors';
import { TriggerProcess, TriggerState, TriggerStatus, Triggers } from '../triggers';

const executeOnApp: TriggerProcess = (state, dispatch) => {
  const {
    hdpathPreview: preview,
    hwkey: { ledger },
  } = state;

  if (
    preview?.display?.seed != null &&
    isHardwareSeed(state, preview.display.seed) &&
    ledger.app != null &&
    ledger.connected
  ) {
    const { [ledger.app]: current } = ledgerByBlockchain;
    const { seed } = preview.display;

    preview.display.entries.forEach((entry) => {
      if (entry.blockchain === current) {
        dispatch(loadAddresses(seed, preview.display.account, current));
      }
    });
  }

  return TriggerStatus.CONTINUE;
};

const onApp: TriggerState = (state) => state.hwkey.ledger.app ?? undefined;

export function run(triggers: Triggers): void {
  triggers.add(onApp, executeOnApp);
}
