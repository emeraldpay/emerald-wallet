import * as os from 'os';
import {
  AddressBalance,
  AssetCode,
  Blockchain,
  EstimationMode,
  isNativeCallError,
  isNativeCallResponse,
} from '@emeraldpay/api';
import {
  AnyCoinCode,
  BlockchainCode,
  Commands,
  Logger,
  PersistentState,
  blockchainCodeToId,
  isBitcoin,
  isEthereum,
} from '@emeraldwallet/core';
import { PersistentStateImpl } from '@emeraldwallet/persistent-state';
import { EmeraldApiAccess } from '@emeraldwallet/services';
import { PartialTx } from '@emeraldwallet/services/lib/ethrpc';
import { ipcMain } from 'electron';
import Application from '../Application';

const log = Logger.forCategory('IPC Handlers');

export function setIpcHandlers(
  app: Application,
  apiAccess: EmeraldApiAccess,
  persistentState: PersistentStateImpl,
): void {
  ipcMain.handle(Commands.GET_VERSION, () => ({
    gitVersion: app.versions?.gitVersion,
    os: {
      arch: os.arch(),
      platform: os.platform(),
      release: os.release(),
    },
    version: app.versions?.version,
  }));

  ipcMain.handle(Commands.GET_APP_SETTINGS, () => app.settings.toJS());

  ipcMain.handle(Commands.SET_TERMS, (event, version: string) => app.settings.setTerms(version));

  ipcMain.handle(
    Commands.LOAD_TX_HISTORY,
    (event, filter?: PersistentState.TxHistoryFilter, query?: PersistentState.PageQuery) =>
      persistentState.txhistory.query(filter, query),
  );

  ipcMain.handle(Commands.SUBMIT_TX_HISTORY, (event, tx: PersistentState.Transaction) =>
    persistentState.txhistory.submit(tx),
  );

  ipcMain.handle(Commands.GET_BALANCE, (event, blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]) => {
    const addressListener = apiAccess.newAddressListener();

    const calls: Promise<AddressBalance[]>[] = tokens.map((token) => {
      let asset = token as AssetCode;

      if (asset.toLowerCase() === 'testbtc') {
        // It's always BTC for bitcoin networks, TESTBTC is our internal code
        asset = 'BTC';
      }

      return addressListener.getBalance(blockchain, address, asset);
    });

    return Promise.all(calls)
      .then((balances: AddressBalance[][]) =>
        balances.flat().reduce((carry, balance) => {
          let code = balance.asset.code as AnyCoinCode;

          if (code == 'BTC' && balance.asset.blockchain == Blockchain.TESTNET_BITCOIN) {
            code = 'TESTBTC';
          }

          return { ...carry, [code]: balance.balance };
        }, {}),
      )
      .catch((err) => console.warn('Failed to get balances', err));
  });

  ipcMain.handle(Commands.BROADCAST_TX, (event, blockchain: BlockchainCode, tx: string) => {
    if (isEthereum(blockchain)) {
      return app.rpc.chain(blockchain).eth.sendRawTransaction(tx);
    } else if (isBitcoin(blockchain)) {
      return new Promise((resolve, reject) => {
        apiAccess.blockchainClient
          .nativeCall(blockchainCodeToId(blockchain), [
            {
              id: 0,
              method: 'sendrawtransaction',
              payload: [tx],
            },
          ])
          .onData((resp) => {
            if (isNativeCallResponse(resp)) {
              const hash = resp.payload as string;
              log.info('Broadcast transaction: ' + hash);
              resolve(hash);
            } else if (isNativeCallError(resp)) {
              reject(resp.message);
            } else {
              reject('Invalid response from API');
            }
          })
          .onError((err) => reject(err.message));
      });
    } else {
      log.error('Invalid blockchain: ' + blockchain);
    }
  });

  ipcMain.handle(Commands.ESTIMATE_TX, (event, blockchain: BlockchainCode, tx: PartialTx) =>
    app.rpc.chain(blockchain).eth.estimateGas(tx),
  );

  ipcMain.handle(Commands.GET_NONCE, (event, blockchain: BlockchainCode, address: string) =>
    app.rpc.chain(blockchain).eth.getTransactionCount(address),
  );

  ipcMain.handle(Commands.GET_ETH_RECEIPT, (event, blockchain: BlockchainCode, hash: string) =>
    app.rpc.chain(blockchain).eth.getTransactionReceipt(hash),
  );

  ipcMain.handle(Commands.GET_ETH_TX, (event, blockchain: BlockchainCode, hash: string) =>
    app.rpc.chain(blockchain).eth.getTransaction(hash),
  );

  ipcMain.handle(
    Commands.ESTIMATE_FEE,
    async (event, blockchain: BlockchainCode, blocks: number, mode: EstimationMode) => {
      try {
        const fee = await apiAccess.blockchainClient.estimateFees({
          blocks,
          mode,
          blockchain: blockchainCodeToId(blockchain),
        });

        switch (fee.type) {
          case 'bitcoinStd':
            return fee.satPerKb;
          case 'ethereumExt':
            return {
              max: fee.max,
              priority: fee.priority,
            };
          case 'ethereumStd':
            return fee.fee;
        }
      } catch (exception) {
        if (exception instanceof Error) {
          log.error('Cannot estimate fee: ', exception.message);
        }
      }

      return null;
    },
  );

  ipcMain.handle(Commands.GET_TX_META, (event, blockchain: BlockchainCode, txId: string) =>
    persistentState.txmeta.get(blockchain, txId),
  );

  ipcMain.handle(Commands.SET_TX_META, (event, meta: PersistentState.TxMeta) => persistentState.txmeta.set(meta));

  ipcMain.handle(Commands.ADDRESS_BOOK_ADD, (event, item: PersistentState.AddressbookItem) =>
    persistentState.addressbook.add(item),
  );

  ipcMain.handle(Commands.ADDRESS_BOOK_GET, (event, id: string) => persistentState.addressbook.get(id));

  ipcMain.handle(Commands.ADDRESS_BOOK_REMOVE, (event, id: string) => persistentState.addressbook.remove(id));

  ipcMain.handle(Commands.ADDRESS_BOOK_QUERY, (event, filter: PersistentState.AddressbookFilter) =>
    persistentState.addressbook.query(filter),
  );

  ipcMain.handle(Commands.ADDRESS_BOOK_UPDATE, (event, id: string, item: Partial<PersistentState.AddressbookItem>) =>
    persistentState.addressbook.update(id, item),
  );

  ipcMain.handle(Commands.XPUB_POSITION_GET_NEXT, (event, xpub: string) => persistentState.xpubpos.getNext(xpub));

  ipcMain.handle(Commands.XPUB_POSITION_SET, (event, xpub: string, pos: number) =>
    persistentState.xpubpos.setCurrentAddressAt(xpub, pos),
  );

  ipcMain.handle(Commands.XPUB_POSITION_NEXT_SET, (event, xpub: string, pos: number) =>
    persistentState.xpubpos.setNextAddressAtLeast(xpub, pos),
  );

  ipcMain.handle(Commands.XPUB_LAST_INDEX, async (event, blockchain: BlockchainCode, xpub: string, start: number) => {
    const state = await apiAccess.transactionClient.getXpubState({
      address: { start, xpub },
      blockchain: blockchainCodeToId(blockchain),
    });

    return state.lastIndex;
  });

  ipcMain.handle(Commands.LOOKUP_ADDRESS, (event, blockchain: BlockchainCode, address: string) =>
    app.rpc.chain(blockchain).ethers.lookupAddress(address),
  );

  ipcMain.handle(Commands.RESOLVE_NAME, (event, blockchain: BlockchainCode, name: string) =>
    app.rpc.chain(blockchain).ethers.resolveName(name),
  );
}
