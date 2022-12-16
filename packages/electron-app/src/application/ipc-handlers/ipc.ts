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
  BlockchainCode,
  IpcCommands,
  Logger,
  PartialEthereumTransaction,
  PersistentState,
  SettingsOptions,
  TokenData,
  blockchainCodeToId,
  isBitcoin,
  isEthereum,
} from '@emeraldwallet/core';
import { PersistentStateImpl } from '@emeraldwallet/persistent-state';
import { EmeraldApiAccess } from '@emeraldwallet/services';
import { ipcMain } from 'electron';
import Application from '../Application';

const log = Logger.forCategory('IPC Handlers');

export function setIpcHandlers(
  app: Application,
  apiAccess: EmeraldApiAccess,
  persistentState: PersistentStateImpl,
): void {
  ipcMain.handle(IpcCommands.GET_VERSION, () => ({
    gitVersion: app.versions?.gitVersion,
    os: {
      arch: os.arch(),
      platform: os.platform(),
      release: os.release(),
    },
    version: app.versions?.version,
  }));

  ipcMain.handle(IpcCommands.GET_APP_SETTINGS, () => app.settings.toJSON());

  ipcMain.handle(IpcCommands.SET_OPTIONS, (event, options: SettingsOptions) => {
    app.settings.setOptions(options);
  });

  ipcMain.handle(IpcCommands.SET_TERMS, (event, version: string) => {
    app.settings.setTerms(version);
  });

  ipcMain.handle(IpcCommands.SET_TOKENS, (event, tokens: TokenData[]) => {
    app.settings.setTokens(tokens);
  });

  ipcMain.handle(
    IpcCommands.LOAD_TX_HISTORY,
    (event, filter?: PersistentState.TxHistoryFilter, query?: PersistentState.PageQuery) =>
      persistentState.txhistory.query(filter, query),
  );

  ipcMain.handle(IpcCommands.SUBMIT_TX_HISTORY, (event, tx: PersistentState.Transaction) =>
    persistentState.txhistory.submit(tx),
  );

  ipcMain.handle(IpcCommands.GET_BALANCE, (event, blockchain: BlockchainCode, address: string, tokens: string[]) => {
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
        balances.flat().reduce((carry, { asset: { code, blockchain }, balance }) => {
          if (code === 'BTC' && blockchain === Blockchain.TESTNET_BITCOIN) {
            code = 'TESTBTC';
          }

          return { ...carry, [code]: balance };
        }, {}),
      )
      .catch((error) => console.warn('Failed to get balances', error));
  });

  ipcMain.handle(IpcCommands.BROADCAST_TX, (event, blockchain: BlockchainCode, tx: string) => {
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

  ipcMain.handle(IpcCommands.ESTIMATE_TX, (event, blockchain: BlockchainCode, tx: PartialEthereumTransaction<string>) =>
    app.rpc.chain(blockchain).eth.estimateGas(tx),
  );

  ipcMain.handle(IpcCommands.GET_NONCE, (event, blockchain: BlockchainCode, address: string) =>
    app.rpc.chain(blockchain).eth.getTransactionCount(address),
  );

  ipcMain.handle(IpcCommands.GET_ETH_RECEIPT, (event, blockchain: BlockchainCode, hash: string) =>
    app.rpc.chain(blockchain).eth.getTransactionReceipt(hash),
  );

  ipcMain.handle(IpcCommands.GET_ETH_TX, (event, blockchain: BlockchainCode, hash: string) =>
    app.rpc.chain(blockchain).eth.getTransaction(hash),
  );

  ipcMain.handle(
    IpcCommands.ESTIMATE_FEE,
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
          log.error('Cannot estimate fee:', exception.message);
        }
      }

      return null;
    },
  );

  ipcMain.handle(IpcCommands.GET_TX_META, (event, blockchain: BlockchainCode, txId: string) =>
    persistentState.txmeta.get(blockchain, txId),
  );

  ipcMain.handle(IpcCommands.SET_TX_META, (event, meta: PersistentState.TxMeta) => persistentState.txmeta.set(meta));

  ipcMain.handle(IpcCommands.ADDRESS_BOOK_ADD, (event, item: PersistentState.AddressbookItem) =>
    persistentState.addressbook.add(item),
  );

  ipcMain.handle(IpcCommands.ADDRESS_BOOK_GET, (event, id: string) => persistentState.addressbook.get(id));

  ipcMain.handle(IpcCommands.ADDRESS_BOOK_REMOVE, (event, id: string) => persistentState.addressbook.remove(id));

  ipcMain.handle(IpcCommands.ADDRESS_BOOK_QUERY, (event, filter: PersistentState.AddressbookFilter) =>
    persistentState.addressbook.query(filter),
  );

  ipcMain.handle(IpcCommands.ADDRESS_BOOK_UPDATE, (event, id: string, item: Partial<PersistentState.AddressbookItem>) =>
    persistentState.addressbook.update(id, item),
  );

  ipcMain.handle(IpcCommands.XPUB_POSITION_GET_NEXT, (event, xpub: string) => persistentState.xpubpos.getNext(xpub));

  ipcMain.handle(IpcCommands.XPUB_POSITION_SET, (event, xpub: string, pos: number) =>
    persistentState.xpubpos.setCurrentAddressAt(xpub, pos),
  );

  ipcMain.handle(IpcCommands.XPUB_POSITION_NEXT_SET, (event, xpub: string, pos: number) =>
    persistentState.xpubpos.setNextAddressAtLeast(xpub, pos),
  );

  ipcMain.handle(
    IpcCommands.XPUB_LAST_INDEX,
    async (event, blockchain: BlockchainCode, xpub: string, start: number) => {
      const state = await apiAccess.transactionClient.getXpubState({
        address: { start, xpub },
        blockchain: blockchainCodeToId(blockchain),
      });

      return state.lastIndex;
    },
  );

  ipcMain.handle(IpcCommands.LOOKUP_ADDRESS, (event, blockchain: BlockchainCode, address: string) =>
    app.rpc.chain(blockchain).ethers.lookupAddress(address),
  );

  ipcMain.handle(IpcCommands.RESOLVE_NAME, (event, blockchain: BlockchainCode, name: string) =>
    app.rpc.chain(blockchain).ethers.resolveName(name),
  );
}
