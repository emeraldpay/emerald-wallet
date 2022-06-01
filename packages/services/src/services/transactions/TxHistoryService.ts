import { IEmeraldVault, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { AnyCoinCode, blockchainIdToCode } from '@emeraldwallet/core';
import { BlockRef, ChangeType, State, Status } from '@emeraldwallet/core/lib/persisistentState';
import { PersistentStateImpl } from '@emeraldwallet/persistent-state';
import { WebContents } from 'electron';
import { EmeraldApiAccess } from '../../emerald-client/ApiAccess';
import { IService } from '../Services';

type EntryIdentifier = { entryId: string; blockchain: number; identifier: string };

export class TxHistoryService implements IService {
  public readonly id: string;

  private apiAccess: EmeraldApiAccess;
  private persistentState: PersistentStateImpl;
  private vault: IEmeraldVault;
  private webContents?: WebContents;

  constructor(
    apiAccess: EmeraldApiAccess,
    persistentState: PersistentStateImpl,
    vault: IEmeraldVault,
    webContents: WebContents,
  ) {
    this.id = 'TransactionHistoryListener';

    this.apiAccess = apiAccess;
    this.persistentState = persistentState;
    this.vault = vault;
    this.webContents = webContents;
  }

  start(): void {
    this.vault.listWallets().then((wallets) =>
      wallets.forEach((wallet) =>
        wallet.entries
          .reduce<EntryIdentifier[]>((carry, entry) => {
            const entryData = { entryId: entry.id, blockchain: entry.blockchain };

            if (isEthereumEntry(entry)) {
              const { value: address } = entry.address ?? {};

              if (address == null) {
                return carry;
              }

              return [...carry, { ...entryData, identifier: address }];
            }

            if (isBitcoinEntry(entry)) {
              return [...carry, ...entry.xpub.map(({ xpub }) => ({ ...entryData, identifier: xpub }))];
            }

            return carry;
          }, [])
          .forEach(({ entryId, blockchain, identifier }) =>
            this.persistentState.txhistory.get_cursor(identifier).then((cursor) =>
              this.apiAccess.transactionClient
                .getAddressTx({
                  blockchain,
                  address: identifier,
                  cursor: cursor ?? undefined,
                })
                .then((transactions) =>
                  transactions.forEach((tx) => {
                    let block: BlockRef | null = null;

                    if (tx.block != null) {
                      const { height, timestamp, hash: blockId } = tx.block;

                      block = {
                        blockId,
                        height,
                        timestamp,
                      };
                    }

                    this.persistentState.txhistory
                      .submit({
                        block,
                        blockchain,
                        changes: tx.transfers.map((transfer) => {
                          const [address] = transfer.addresses;

                          return {
                            address,
                            amount: transfer.amount.toString(),
                            // TODO Switch to data from response when available
                            asset: blockchainIdToCode(blockchain).toUpperCase() as AnyCoinCode,
                            type: ChangeType.TRANSFER,
                            wallet: entryId,
                          };
                        }),
                        sinceTimestamp: tx.block?.timestamp ?? new Date(),
                        confirmTimestamp:
                          tx.removed === false && tx.mempool === false ? tx.block?.timestamp ?? new Date() : undefined,
                        state:
                          tx.removed === true
                            ? State.REPLACED
                            : tx.mempool === true
                            ? State.SUBMITTED
                            : State.CONFIRMED,
                        status: Status.UNKNOWN,
                        txId: tx.txId,
                      })
                      .then(() => {
                        if (tx.cursor != null) {
                          this.persistentState.txhistory.set_cursor(identifier, tx.cursor);
                        }
                      });
                  }),
                ),
            ),
          ),
      ),
    );
  }

  stop(): void {
    // Nothing
  }

  reconnect(): void {
    // Nothing
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }
}
