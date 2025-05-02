import {AnyAddress, isSingleAddress, isXpubAddress, Publisher, transaction as TransactionApi} from '@emeraldpay/api';
import { EntryIdOp, IEmeraldVault, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  Blockchains,
  IpcCommands,
  Logger,
  PersistentState,
  SettingsManager,
  TokenData,
  blockchainCodeToId,
  blockchainIdToCode,
} from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import { IpcMain, WebContents } from 'electron';
import { EmeraldApiAccess } from '../emerald-client/ApiAccess';
import { Service } from './ServiceManager';
import {BufferedHandler} from "./BuffereHandler";

const { ChangeType: ApiType, Direction: ApiDirection } = TransactionApi;
const { ChangeType: StateType, Direction: StateDirection, State, Status } = PersistentState;

type EntryIdentifier = { entryId: string; blockchain: number; identifier: string };
type TransactionHandler = (tx: TransactionApi.AddressTransaction[]) => Promise<void>;

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

  private subscribers: Map<string, Publisher<TransactionApi.AddressTransaction>> = new Map();

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
      this.subscribe(identifier, blockchainCodeToId(blockchain), entryId),
    );
  }

  start(): void {
    const now = Date.now();
    const lastCursor = this.settings.getLastCursor() ?? 0;

    let resetCursors = false;

    if (now - lastCursor > 7 * 24 * 60 * 60 * 1000) {
      this.settings.setLastCursor(now);

      resetCursors = true;
    }

    log.info(`Starting service with${resetCursors ? '' : 'out'} resetting cursors...`);

    this.vault.listWallets().then((wallets) => {
      wallets.forEach((wallet) => {
        const entryIdentifiers: EntryIdentifier[] = [];

        wallet.entries.forEach((entry) => {
          const entryData = {entryId: entry.id, blockchain: entry.blockchain};
          if (isEthereumEntry(entry)) {
            if (entry.address == null) {
              return;
            }

            entryIdentifiers.push({...entryData, identifier: entry.address.value});
          } else if (isBitcoinEntry(entry)) {
            entry.xpub.forEach((xpub) => {
              entryIdentifiers.push({...entryData, identifier: xpub.xpub});
            })
          }
        });

        entryIdentifiers.forEach(({ blockchain, identifier }) => {
          if (resetCursors) {
            this.persistentState.txhistory
              .setCursor(identifier, '')
              .catch((error) =>
                log.error(
                  `Error while set empty cursor for ${identifier} on ${blockchainIdToCode(blockchain)} blockchain`,
                  error,
                ),
              );
          }
        });

        this.persistentState.txhistory
          .query({ state: State.SUBMITTED })
          .then(({ items: transactions }) => {
              let removePromise =  Promise.all(
                transactions.map(({blockchain: txBlockchain, txId}) =>
                  this.persistentState.txhistory.remove(txBlockchain, txId)
                ),
              );
              removePromise.then(() => {
                this.webContents.send(IpcCommands.STORE_DISPATCH, {
                  type: 'WALLET/HISTORY/REMOVE_STORED_TX',
                  txIds: transactions.map((tx) => tx.txId),
                })
              })
            },
          )
          .then(() =>
            entryIdentifiers.forEach(({ blockchain, entryId, identifier }) =>
              this.subscribe(identifier, blockchain, entryId),
            ),
          )
          .catch((error) => log.error('Error while processing transactions history', error));
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
    const blockchainCode = blockchainIdToCode(blockchain);

    let address: AnyAddress;
    if (isSingleAddress(identifier)) {
      address = identifier;
    } else if (isXpubAddress(identifier)) {
      address = identifier;
    } else {
      log.error(`Invalid address ${identifier} for ${blockchainCode} blockchain`);
      return;
    }

    this.persistentState.txhistory
      .getCursor(identifier)
      .then((cursor) => {
        log.info(
          `Subscribing for ${identifier} on ${blockchainCode}`,
          `with ${cursor == null ? 'empty cursor' : `cursor ${cursor}`}...`,
        );

        const request: TransactionApi.GetTransactionsRequest = {
          blockchain,
          address,
          cursor: cursor ?? undefined,
        };

        const handler = this.processTransaction(identifier, blockchain, entryId);
        const buffer = new BufferedHandler(handler);
        buffer.start();

        this.apiAccess.transactionClient
          .getTransactions(request)
          .onData(buffer.accept())
          .onError((error) => {
              log.error(
                `Error while getting transactions for ${identifier} on ${blockchainCode},`,
                `restart after ${this.restartTimeout} seconds...`,
                error,
              );
              buffer.flush();
            });

        const subscriber = this.apiAccess.transactionClient
          .subscribeTransactions(request)
          .onData(buffer.accept())
          .onError((error) => log.error(`Error while subscribing for ${identifier} on ${blockchainCode}`, error))
          .finally(() => {
            log.info(
              `Subscription for ${identifier} on ${blockchainCode} is closed,`,
              `restart after ${this.restartTimeout} seconds...`,
            );
            setTimeout(() => this.subscribe(identifier, blockchain, entryId), this.restartTimeout * 1000);
            buffer.flush();
          });

        this.subscribers.set(identifier, subscriber);
      })
      .catch((error) => log.error(`Error while getting history cursor for ${identifier} on ${blockchainCode}`, error));
  }

  private processTransaction(identifier: string, blockchain: number, entryId: string): TransactionHandler {
    const blockchainCode = blockchainIdToCode(blockchain);

    return async (txs: TransactionApi.AddressTransaction[]) => {
      let removed = txs.filter((tx) => tx.removed);
      let added = txs.filter((tx) => !tx.removed);

      log.info(`Receive transactions ${txs.length} (+${added.length}, -${removed.length}) for ${identifier} on ${blockchainCode}...`);

      removed.forEach((tx) => {
        this.persistentState.txhistory
          .remove(blockchain, tx.txId)
          .catch((error) =>
            log.error(`Error while removing transaction for ${identifier} on ${blockchainCode} from state`, error),
          );
      });
      this.webContents.send(IpcCommands.STORE_DISPATCH, {
        type: 'WALLET/HISTORY/REMOVE_STORED_TX',
        txIds: removed.map((tx) => tx.txId),
      });

      let mergedPromise = added.map((tx) => {
        let confirmation: PersistentState.TransactionConfirmation | null = null;

        const now = new Date();

        if (tx.block != null) {
          const { height, timestamp, hash: blockId } = tx.block;

          confirmation = {
            block: { blockId, height, timestamp },
            blockPos: 0, //TODO actual position
            confirmTimestamp: tx.block.timestamp ?? now,
          };
        }

        if (tx.xpubIndex != null) {
          this.persistentState.xpubpos
            .setCurrentAddressAt(identifier, tx.xpubIndex)
            .catch((error) => log.error(`Error while set xPub position for ${identifier} on ${blockchainCode}`, error));
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

        return this.persistentState.txhistory
          .submit({ ...confirmation, ...transaction })
          .then((merged) => {
            if (tx.cursor != null && tx.cursor.length > 0) {
              return this.persistentState.txhistory
                .setCursor(identifier, tx.cursor)
                .catch((error) =>
                  log.error(`Error while set cursor ${tx.cursor} for ${identifier} on ${blockchainCode}`, error),
                )
                .then(() => merged);
            } else {
              return Promise.resolve(merged)
            }
          })
      });

      const merged = await Promise.all(mergedPromise);
      const meta = await Promise.all(
        merged.map((tx) =>
          this.persistentState.txmeta
            .get(blockchainCode, tx.txId)
            .catch((error) => {
              log.error(`Error while getting transaction meta for ${identifier} on ${blockchainCode}`, error);
              return null;
            })
        ));

      const walletId = EntryIdOp.of(entryId).extractWalletId();
      this.webContents.send(IpcCommands.STORE_DISPATCH, {
        transactions: merged.map((tx, index) => {
          return { meta: meta[index], transaction: tx };
        }),
        type: 'WALLET/HISTORY/UPDATE_STORED_TX',
        tokens: this.tokens,
        walletId,
      });
    }
  }
}
