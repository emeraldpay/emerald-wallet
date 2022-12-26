import { BlockchainCode, ledgerByBlockchain } from '@emeraldwallet/core';
import { loadAddresses } from './actions';
import { isHardwareSeed } from '../accounts/selectors';
import { TriggerProcess, TriggerState, TriggerStatus, Triggers } from '../triggers';

const onApp: TriggerState = (state) => state.hwkey.ledger.app ?? undefined;

const executeOnApp: TriggerProcess = (state, dispatch) => {
  const {
    hdpathPreview: preview,
    hwkey: {
      ledger: { app, connected },
    },
  } = state;

  if (preview?.display?.seed != null && isHardwareSeed(state, preview.display.seed) && app != null && connected) {
    const { [app]: ledgerBlockchain } = ledgerByBlockchain;
    const { account, seed } = preview.display;

    preview.display.entries.forEach((entry) => {
      if (
        entry.blockchain === ledgerBlockchain ||
        (ledgerBlockchain === BlockchainCode.ETC && entry.blockchain === BlockchainCode.ETH)
      ) {
        console.log('TRIGGER', seed, entry.blockchain, account);
        dispatch(loadAddresses(seed, entry.blockchain, account));
      }
    });
  }

  return TriggerStatus.CONTINUE;
};

export function run(triggers: Triggers): void {
  triggers.add(onApp, executeOnApp);
}
