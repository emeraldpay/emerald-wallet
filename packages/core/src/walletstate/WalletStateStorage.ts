import {WalletState, EntryId, AddressRole} from "@emeraldpay/emerald-vault-core";


export interface WalletStateStorage {

    load(): Promise<WalletState>;

    update(entryId: EntryId, receive: number | undefined, change: number | undefined): Promise<WalletState | undefined>;

    next(entryId: EntryId, type: AddressRole): Promise<WalletState>;

}