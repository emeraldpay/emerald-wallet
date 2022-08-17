import { Direction as ApiDirection, BitcoinTransfer, EthereumTransfer } from '@emeraldpay/api/lib/typesTransaction';
import { EntryIdOp, IEmeraldVault, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { Blockchains, Logger, PersistentState, blockchainIdToCode, isBitcoin } from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import { PersistentStateImpl } from '@emeraldwallet/persistent-state';
import { txhistory } from '@emeraldwallet/store';
import { WebContents } from 'electron';
import { EmeraldApiAccess } from '../../emerald-client/ApiAccess';
import { IService } from '../Services';

const { ChangeType, Direction: StateDirection, State, Status } = PersistentState;

type EntryIdentifier = { entryId: string; blockchain: number; identifier: string };

const log = Logger.forCategory('TxService');

export class TxService implements IService {
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
            this.persistentState.txhistory.getCursor(identifier).then((cursor) =>
              this.apiAccess.transactionClient
                .subscribeAddressTx({
                  blockchain,
                  address: identifier,
                  cursor: cursor ?? undefined,
                })
                .onData((tx) => {
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

                  let changes: PersistentState.Change[];

                  if (isBitcoin(blockchainCode)) {
                    changes = (tx.transfers as BitcoinTransfer[]).reduce<PersistentState.Change[]>(
                      (carry, transfer) => [
                        ...carry,
                        {
                          address: tx.address,
                          amount: transfer.amount,
                          asset: 'BTC',
                          direction:
                            transfer.direction == ApiDirection.EARN ? StateDirection.EARN : StateDirection.SPEND,
                          type: ChangeType.TRANSFER,
                          wallet: entryId,
                        },
                        ...transfer.addressAmounts.map<PersistentState.Change>((item) => ({
                          address: item.address,
                          amount: item.amount,
                          asset: 'BTC',
                          direction:
                            transfer.direction == ApiDirection.EARN ? StateDirection.SPEND : StateDirection.EARN,
                          type: ChangeType.TRANSFER,
                        })),
                      ],
                      [],
                    );

                    if (tx.xpubIndex != null) {
                      this.persistentState.xpubpos
                        .setAtLeast(identifier, tx.xpubIndex)
                        .catch((error) => log.error('Error while set xPub position: ', error));
                    }
                  } else {
                    changes = (tx.transfers as EthereumTransfer[]).reduce<PersistentState.Change[]>(
                      (carry, transfer) => {
                        const asset =
                          (transfer.contractAddress == null
                            ? Blockchains[blockchainCode].params.coinTicker
                            : registry.byAddress(blockchainCode, transfer.contractAddress)?.symbol) ?? 'UNKNOWN';

                        const items: PersistentState.Change[] = [
                          {
                            asset,
                            address: tx.address,
                            amount: transfer.amount,
                            direction:
                              transfer.direction == ApiDirection.EARN ? StateDirection.EARN : StateDirection.SPEND,
                            type: ChangeType.TRANSFER,
                            wallet: entryId,
                          },
                          {
                            asset,
                            address: transfer.address,
                            amount: transfer.amount,
                            direction:
                              transfer.direction == ApiDirection.EARN ? StateDirection.SPEND : StateDirection.EARN,
                            type: ChangeType.TRANSFER,
                          },
                        ];

                        return [...carry, ...items];
                      },
                      [],
                    );
                  }

                  this.persistentState.txhistory
                    .submit({
                      block,
                      blockchain,
                      changes,
                      sinceTimestamp: tx.block?.timestamp ?? new Date(),
                      confirmTimestamp:
                        tx.removed === false && tx.mempool === false ? tx.block?.timestamp ?? new Date() : undefined,
                      state:
                        tx.removed === true ? State.REPLACED : tx.mempool === true ? State.SUBMITTED : State.CONFIRMED,
                      status: Status.UNKNOWN, // TODO Set from backend
                      txId: tx.txId,
                    })
                    .then((merged) => {
                      if (tx.cursor != null) {
                        this.persistentState.txhistory.setCursor(identifier, tx.cursor);
                      }

                      const walletId = EntryIdOp.of(entryId).extractWalletId();

                      this.webContents?.send('store', txhistory.actions.updateTransaction(walletId, merged));
                    })
                    .catch((error) => log.error('Error while submitting TX state: ', error));
                }),
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
