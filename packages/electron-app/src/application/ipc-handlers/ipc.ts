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
  blockchainCodeToId,
  Commands,
  isBitcoin,
  isEthereum,
  Logger,
  PersistentState,
} from '@emeraldwallet/core';
import { PersistentStateImpl } from '@emeraldwallet/persistent-state';
import { EmeraldApiAccess } from '@emeraldwallet/services';
import { ipcMain } from 'electron';
import * as os from 'os';
import Application from '../Application';

interface BalanceResult {
  asset: AnyCoinCode;
  balance: string;
}

const log = Logger.forCategory('IPC Handlers');

export function setIpcHandlers(app: Application, apiAccess: EmeraldApiAccess, persistentState: PersistentStateImpl) {
  ipcMain.handle(Commands.GET_VERSION, async (event, args) => {
    const osDetails = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
    };
    return {
      os: osDetails,
      version: app.versions?.version,
      gitVersion: app.versions?.gitVersion,
    };
  });

  ipcMain.handle(Commands.GET_APP_SETTINGS, () => {
    return app.settings.toJS();
  });

  ipcMain.handle(Commands.SET_TERMS, (event: any, v: string) => {
    app.settings.setTerms(v);
  });

  ipcMain.handle(Commands.LOAD_TX_HISTORY, async (event: any, entryIds: string[]) => {
    return entryIds.reduce<Promise<PersistentState.Transaction[]>>(async (carry, entryId) => {
      const [txs, { items }] = await Promise.all([carry, persistentState.txhistory.query({ wallet: entryId })]);

      return txs.concat(items);
    }, Promise.resolve([]));
  });

  ipcMain.handle(
    Commands.GET_BALANCE,
    (event: any, blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]) => {
      const addressListener = apiAccess.newAddressListener();

      const calls: Promise<AddressBalance[]>[] = tokens.map((token) => {
        let asset = token as AssetCode;

        if (asset.toLowerCase() === 'testbtc') {
          // it always BTC for bitcoin networks, TESTBTC is our internal code
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
    },
  );

  ipcMain.handle(Commands.BROADCAST_TX, async (event: any, blockchain: BlockchainCode, tx: string) => {
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

  ipcMain.handle(Commands.ESTIMATE_TX, (event: any, blockchain: BlockchainCode, tx: any) => {
    return app.rpc.chain(blockchain).eth.estimateGas(tx);
  });

  ipcMain.handle(Commands.GET_NONCE, (event: any, blockchain: BlockchainCode, address: string) => {
    return app.rpc.chain(blockchain).eth.getTransactionCount(address);
  });

  ipcMain.handle(Commands.GET_ETH_TX, (event: any, blockchain: BlockchainCode, hash: string) => {
    return app.rpc.chain(blockchain).eth.getTransaction(hash);
  });

  ipcMain.handle(
    Commands.ESTIMATE_FEE,
    async (event: any, blockchain: BlockchainCode, blocks: number, mode: EstimationMode) => {
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
              expect: fee.expect,
              max: fee.max,
              priority: fee.priority,
            };
          case 'ethereumStd':
            return fee.fee;
        }
      } catch (exception) {
        log.error('Cannot estimate fee: ', exception.message);
      }

      return null;
    },
  );

  ipcMain.handle(Commands.GET_TX_META, (event, blockchain: BlockchainCode, txId: string) =>
    persistentState.txmeta.get(blockchain, txId),
  );

  ipcMain.handle(Commands.SET_TX_META, (event, meta: PersistentState.TxMeta) => persistentState.txmeta.set(meta));
}
