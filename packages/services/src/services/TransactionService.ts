import { transaction as ApiTransaction, Publisher } from '@emeraldpay/api';
import { EntryIdOp, IEmeraldVault, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  Blockchains,
  IpcCommands,
  Logger,
  PersistentState,
  SettingsManager,
  TokenData,
  blockchainIdToCode,
} from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import { IpcMain, WebContents } from 'electron';
import { EmeraldApiAccess } from '../emerald-client/ApiAccess';
import { Service } from './ServiceManager';

const { ChangeType: ApiType, Direction: ApiDirection } = ApiTransaction;
const { ChangeType: StateType, Direction: StateDirection, State, Status } = PersistentState;

type EntryIdentifier = { entryId: string; blockchain: number; identifier: string };

const log = Logger.forCategory('TransactionService');

export class TransactionService implements Service {
  readonly id = 'TransactionService';

  private apiAccess: EmeraldApiAccess;
  private ipcMain: IpcMain;
  private persistentState: PersistentStateManager;
  private settings: SettingsManager;
  private tokens: TokenData[];
  private vault: IEmeraldVault;
  private webContents: WebContents;

  private subscribers: Map<string, Publisher<ApiTransaction.AddressTxResponse>> = new Map();

  private readonly restartTimeout = 5;

  constructor(
    ipcMain: IpcMain,
    apiAccess: EmeraldApiAccess,
    settings: SettingsManager,
    persistentState: PersistentStateManager,
    vault: IEmeraldVault,
    webContents: WebContents,
  ) {
    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.persistentState = persistentState;
    this.settings = settings;
    this.vault = vault;
    this.webContents = webContents;

    this.tokens = settings.getTokens();

    ipcMain.handle(IpcCommands.TXS_SET_TOKENS, (event, tokens) => {
      this.tokens = tokens;

      this.stop();
      this.start();
    });

    ipcMain.handle(IpcCommands.TXS_SUBSCRIBE, (event, identifier, blockchain, entryId) =>
      this.subscribe(identifier, blockchain, entryId),
    );
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
            this.persistentState.txhistory
              .setCursor(identifier, '')
              .catch((error) => log.error(`Error while set empty cursor for ${identifier}:`, error));
          }
        });

        this.persistentState.txhistory
          .query({ state: State.SUBMITTED })
          .then(({ items: transactions }) =>
            Promise.all(
              transactions.map(({ blockchain: txBlockchain, txId }) =>
                this.persistentState.txhistory.remove(txBlockchain, txId).then(() =>
                  this.webContents.send(IpcCommands.STORE_DISPATCH, {
                    type: 'WALLET/HISTORY/REMOVE_STORED_TX',
                    txId,
                  }),
                ),
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
        log.info(`Subscribing for ${identifier} with ${cursor == null ? 'empty cursor' : `cursor ${cursor}`}...`);

        this.subscribers.set(
          identifier,
          this.apiAccess.transactionClient
            .subscribeAddressTx({
              blockchain,
              address: identifier,
              cursor: cursor ?? undefined,
            })
            .onData((tx) => {
              log.info(`Receive transaction ${tx.txId} for ${identifier}...`);

              if (tx.removed) {
                this.persistentState.txhistory
                  .remove(blockchain, tx.txId)
                  .then(() =>
                    this.webContents.send(IpcCommands.STORE_DISPATCH, {
                      type: 'WALLET/HISTORY/REMOVE_STORED_TX',
                      txId: tx.txId,
                    }),
                  )
                  .catch((error) => log.error(`Error while removing transaction for ${identifier} from state:`, error));
              } else {
                let confirmation: PersistentState.TransactionConfirmation | null = null;

                const now = new Date();

                if (tx.block != null) {
                  const { height, timestamp, hash: blockId } = tx.block;

                  confirmation = {
                    block: { blockId, height, timestamp },
                    blockPos: 0, // TODO Get transaction index inside the block
                    confirmTimestamp: tx.block.timestamp ?? now,
                  };
                }

                const blockchainCode = blockchainIdToCode(blockchain);

                if (tx.xpubIndex != null) {
                  this.persistentState.xpubpos
                    .setCurrentAddressAt(identifier, tx.xpubIndex)
                    .catch((error) => log.error(`Error while set xPub position for ${identifier}:`, error));
                }

                const transaction: PersistentState.UnconfirmedTransaction = {
                  blockchain,
                  changes: tx.changes.map<PersistentState.Change>((change) => ({
                    address: change.address,
                    amount: change.amount,
                    asset: change.contractAddress ?? Blockchains[blockchainCode].params.coinTicker,
                    direction: change.direction === ApiDirection.SEND ? StateDirection.SPEND : StateDirection.EARN,
                    type: change.type === ApiType.FEE ? StateType.FEE : StateType.TRANSFER,
                    wallet: change.address === tx.address ? entryId : undefined,
                  })),
                  sinceTimestamp: tx.block?.timestamp ?? now,
                  state: tx.mempool ? State.SUBMITTED : State.CONFIRMED,
                  status: tx.failed ? Status.FAILED : Status.OK,
                  txId: tx.txId,
                };

                this.persistentState.txhistory
                  .submit({ ...confirmation, ...transaction })
                  .then((merged) => {
                    if (tx.cursor != null && tx.cursor.length > 0) {
                      this.persistentState.txhistory
                        .setCursor(identifier, tx.cursor)
                        .catch((error) => log.error(`Error while set cursor ${tx.cursor} for ${identifier}:`, error));
                    }

                    const walletId = EntryIdOp.of(entryId).extractWalletId();

                    this.persistentState.txmeta
                      .get(blockchainIdToCode(merged.blockchain), merged.txId)
                      .then((meta) =>
                        this.webContents.send(IpcCommands.STORE_DISPATCH, {
                          meta,
                          walletId,
                          type: 'WALLET/HISTORY/UPDATE_STORED_TX',
                          tokens: this.tokens,
                          transaction: merged,
                        }),
                      )
                      .catch((error) => log.error(`Error while getting transaction meta for ${identifier}:`, error));
                  })
                  .catch((error) => log.error(`Error while submitting transaction data for ${identifier}:`, error));
              }
            })
            .onError((error) => log.error(`Error while subscribing for ${identifier}:`, error))
            .finally(() => {
              log.info(`Subscription for ${identifier} is closed, restart after ${this.restartTimeout} seconds...`);

              setTimeout(() => this.subscribe(identifier, blockchain, entryId), this.restartTimeout * 1000);
            }),
        );
      })
      .catch((error) => log.error(`Error while getting history cursor for ${identifier}:`, error));
  }
}
