import {WalletStateStorage} from "@emeraldwallet/core";
import {WalletState, AddressRole, EntryId, EntryIdOp, AccountIndex} from "@emeraldpay/emerald-vault-core";
import * as ElectronStore from 'electron-store';
import {IEmeraldVault} from "@emeraldpay/emerald-vault-core/lib/vault";

type State = {
  walletState: WalletState
}

const DEFAULT_STATE: State = {
  walletState: {
    accountIndexes: []
  }
};

type AccountUpdate = (prev: AccountIndex) => AccountIndex | null;

export class LocalWalletState implements WalletStateStorage {

  private readonly storage: ElectronStore<State>;
  private readonly vault: IEmeraldVault;

  constructor(vault: IEmeraldVault) {
    this.storage = new ElectronStore({
      name: 'walletState',
      defaults: DEFAULT_STATE
    });
    this.vault = vault;
    this.load().then((state) => this.vault.setState(state));
  }

  load(): Promise<WalletState> {
    return Promise.resolve(this.storage.get("walletState", DEFAULT_STATE.walletState))
  }

  save(walletState: WalletState) {
    this.storage.set("walletState", walletState);
  }

  private internalUpdate(entryId: EntryId, update: AccountUpdate): Promise<WalletState | undefined> {
    const entryIdOp = EntryIdOp.of(entryId);
    return this.load().then((current) => {
      const prevIndex = current.accountIndexes.findIndex((a) => a.walletId == entryIdOp.extractWalletId() && a.entryId == entryIdOp.extractEntryInternalId());
      let change = false;
      if (prevIndex >= 0) {
        const prev = current.accountIndexes[prevIndex];
        const updated = update(prev);
        if (updated != null) {
          current.accountIndexes[prevIndex] = updated;
          change = true;
        }
      } else {
        const value = update({
          walletId: entryIdOp.extractWalletId(),
          entryId: entryIdOp.extractEntryInternalId(),
          receive: 0,
          change: 0
        });
        if (value != null) {
          current.accountIndexes.push(value);
          change = true
        }
      }
      if (change) {
        this.save(current);
        return this.vault.setState(current).then(() => current);
      }
      return undefined
    });
  }

  update(entryId: EntryId, receive: number | undefined, change: number | undefined): Promise<WalletState | undefined> {
    return this.internalUpdate(entryId, (prev) => {
      if (receive && receive > prev.receive) {
        prev.receive = receive;
      }
      if (change && change > prev.change) {
        prev.change = change;
      }
      return prev;
    });
  }

  next(entryId: EntryId, type: AddressRole): Promise<WalletState> {
    return this.internalUpdate(entryId, (prev) => {
      if (type == "change") {
        prev.change++;
      } else if (type == "receive") {
        prev.receive++;
      }
      return prev;
    }).then((value) => value!);
  }

}