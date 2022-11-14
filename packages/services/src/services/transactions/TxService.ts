import { transaction as ApiTransaction, Publisher } from '@emeraldpay/api';
import { EntryIdOp, IEmeraldVault, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { Blockchains, Logger, PersistentState, SettingsManager, blockchainIdToCode } from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import { PersistentStateImpl } from '@emeraldwallet/persistent-state';
import { txhistory } from '@emeraldwallet/store';
import { WebContents } from 'electron';
import { EmeraldApiAccess } from '../../emerald-client/ApiAccess';
import { IService } from '../Services';

const { ChangeType: ApiType, Direction: ApiDirection } = ApiTransaction;
const { ChangeType: StateType, Direction: StateDirection, State, Status } = PersistentState;

type EntryIdentifier = { entryId: string; blockchain: number; identifier: string };

const log = Logger.forCategory('TxService');

export class TxService implements IService {
  public readonly id: string;

  private apiAccess: EmeraldApiAccess;
  private persistentState: PersistentStateImpl;
  private settings: SettingsManager;
  private vault: IEmeraldVault;
  private webContents?: WebContents;

  private readonly restartTimeout = 5;

  private subscribers: Map<string, Publisher<ApiTransaction.AddressTxResponse>> = new Map();

  constructor(
    settings: SettingsManager,
    apiAccess: EmeraldApiAccess,
    persistentState: PersistentStateImpl,
    vault: IEmeraldVault,
    webContents: WebContents,
  ) {
    this.id = 'TransactionHistoryListener';

    this.apiAccess = apiAccess;
    this.persistentState = persistentState;
    this.settings = settings;
    this.vault = vault;
    this.webContents = webContents;
  }

  start(): void {
    const now = new Date().getTime();
    const lastCursor = this.settings.getLastCursor() ?? 0;

    let resetCursors = false;

    if (now - lastCursor > 7 * 24 * 60 * 60 * 1000) {
      this.settings.setLastCursor(now);

      resetCursors = true;
    }

    log.info(`Starting service with${resetCursors ? '' : 'out'} resetting cursors...`);

    this.vault.listWallets().then((wallets) => {
      wallets.forEach((wallet) => {
        const entryIdentifiers = wallet.entries.reduce<EntryIdentifier[]>((carry, entry) => {
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
        }, []);

        entryIdentifiers.forEach(({ identifier }) => {
          if (resetCursors) {
            this.persistentState.txhistory.setCursor(identifier, '');
          }
        });

        this.persistentState.txhistory
          .query({ state: State.SUBMITTED })
          .then(({ items: transactions }) =>
            Promise.all(
              transactions.map(({ blockchain: txBlockchain, txId }) =>
                this.persistentState.txhistory
                  .remove(txBlockchain, txId)
                  .then(() => this.webContents?.send('store', txhistory.actions.removeTransaction(txId))),
              ),
            ),
          )
          .then(() =>
            entryIdentifiers.forEach(({ blockchain, entryId, identifier }) =>
              this.subscribe(identifier, blockchain, entryId),
            ),
          )
          .catch((error) => log.error('Error while processing transactions history:', error));
      });
    });
  }

  stop(): void {
    this.subscribers.forEach((subscriber) => subscriber.cancel());
    this.subscribers.clear();
  }

  reconnect(): void {
    this.stop();
    this.start();
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  private subscribe(identifier: string, blockchain: number, entryId: string): void {
    this.persistentState.txhistory
      .getCursor(identifier)
      .then((cursor) => {
        log.info(
          `Subscribing for address ${identifier} with ${cursor == null ? 'empty cursor' : `cursor ${cursor}`}...`,
        );

        this.subscribers.set(
          identifier,
          this.apiAccess.transactionClient
            .subscribeAddressTx({
              blockchain,
              address: identifier,
              cursor: cursor ?? undefined,
            })
            .onData((tx) => {
              log.info(`Receive transaction ${tx.txId} for address ${identifier}...`);

              if (tx.removed) {
                this.persistentState.txhistory
                  .remove(blockchain, tx.txId)
                  .catch((error) =>
                    log.error(`Error while removing transaction for address ${identifier} from state:`, error),
                  );
              } else {
                let block: PersistentState.BlockRef | null = null;

                if (tx.block != null) {
                  const { height, timestamp, hash: blockId } = tx.block;

                  block = {
                    blockId,
                    height,
                    timestamp,
                  };
                }

                const blockchainCode = blockchainIdToCode(blockchain);
                const now = new Date();

                if (tx.xpubIndex != null) {
                  this.persistentState.xpubpos
                    .setCurrentAddressAt(identifier, tx.xpubIndex)
                    .catch((error) => log.error(`Error while set xPub position for address ${identifier}:`, error));
                }

                this.persistentState.txhistory
                  .submit({
                    block,
                    blockchain,
                    changes: tx.changes.map<PersistentState.Change>((change) => {
                      const asset =
                        (change.contractAddress == null
                          ? Blockchains[blockchainCode].params.coinTicker
                          : registry.byTokenAddress(blockchainCode, change.contractAddress)?.symbol) ?? 'UNKNOWN';

                      return {
                        asset,
                        address: change.address,
                        amount: change.amount,
                        direction: change.direction === ApiDirection.SEND ? StateDirection.SPEND : StateDirection.EARN,
                        type: change.type === ApiType.FEE ? StateType.FEE : StateType.TRANSFER,
                        wallet: change.address === tx.address ? entryId : undefined,
                      };
                    }),
                    confirmTimestamp: tx.mempool === false ? tx.block?.timestamp ?? now : undefined,
                    sinceTimestamp: tx.block?.timestamp ?? now,
                    state: tx.mempool === true ? State.SUBMITTED : State.CONFIRMED,
                    status: tx.failed ? Status.FAILED : Status.OK,
                    txId: tx.txId,
                  })
                  .then((merged) => {
                    if ((tx.cursor?.length ?? 0) > 0) {
                      this.persistentState.txhistory.setCursor(identifier, tx.cursor);
                    }

                    const walletId = EntryIdOp.of(entryId).extractWalletId();

                    this.persistentState.txmeta
                      .get(blockchainIdToCode(merged.blockchain), merged.txId)
                      .then((meta) =>
                        this.webContents?.send('store', txhistory.actions.updateTransaction(walletId, merged, meta)),
                      )
                      .catch((error) =>
                        log.error(`Error while getting transaction meta for address ${identifier}:`, error),
                      );
                  })
                  .catch((error) =>
                    log.error(`Error while submitting transaction data for address ${identifier}:`, error),
                  );
              }
            })
            .onError((error) => log.error(`Error while subscribing for address ${identifier}:`, error))
            .finally(() => {
              log.info(`Connection closed for address ${identifier}, restart after ${this.restartTimeout} seconds...`);

              setTimeout(() => this.subscribe(identifier, blockchain, entryId), this.restartTimeout * 1000);
            }),
        );
      })
      .catch((error) => log.error(`Error while getting history cursor for address ${identifier}:`, error));
  }
}
