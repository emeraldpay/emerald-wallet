import {TriggerProcess, Triggers, TriggerState, TriggerStatus} from "../triggers";
import {BlockchainCode} from "@emeraldwallet/core";
import {LedgerApp} from "@emeraldpay/emerald-vault-core";
import {loadAddresses} from "./actions";

const appsByBlockchain: Record<LedgerApp, BlockchainCode> = {
  "bitcoin": BlockchainCode.BTC,
  "bitcoin-testnet": BlockchainCode.TestBTC,
  "ethereum": BlockchainCode.ETH,
  "ethereum-classic": BlockchainCode.ETC
}

const onApp: TriggerState = (state) => state.hwkey.ledger.app || undefined;

const executeOnApp: TriggerProcess = (state, dispatch) => {
  const preview = state.hdpathPreview;
  if (preview && preview.display.seed &&
    state.hwkey.ledger.connected && state.hwkey.ledger.app) {
    const app = state.hwkey.ledger.app;
    const current = appsByBlockchain[app];
    preview.display.entries.forEach((entry) => {
      if (entry.blockchain == current) {
        const seed = preview.display.seed!;
        dispatch(loadAddresses(seed, preview.display.account, [current]))
      }
    })
  }
  return TriggerStatus.CONTINUE;
}

export function run(triggers: Triggers) {
  triggers.add(onApp, executeOnApp);
}