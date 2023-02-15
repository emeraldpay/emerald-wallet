import { readFile } from 'fs/promises';
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
  EthereumBasicTransaction,
  IpcCommands,
  Logger,
  SettingsOptions,
  TokenData,
  blockchainCodeToId,
  isBitcoin,
  isEthereum,
} from '@emeraldwallet/core';
import { EmeraldApiAccess } from '@emeraldwallet/services';
import { ipcMain } from 'electron';
import { Application } from '../Application';

const log = Logger.forCategory('IPC::API');

export function setupApiIpc(app: Application, apiAccess: EmeraldApiAccess): void {
  ipcMain.handle(IpcCommands.GET_APP_SETTINGS, () => app.settings.toJSON());

  ipcMain.handle(IpcCommands.GET_VERSION, () => ({
    appVersion: app.versions?.version,
    gitVersion: app.versions?.gitVersion,
    osVersion: {
      arch: os.arch(),
      platform: os.platform(),
      release: os.release(),
    },
  }));

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

  ipcMain.handle(IpcCommands.ESTIMATE_TX, (event, blockchain: BlockchainCode, tx: EthereumBasicTransaction) =>
    app.rpc.chain(blockchain).eth.estimateGas(tx),
  );

  ipcMain.handle(IpcCommands.GET_ETH_RECEIPT, (event, blockchain: BlockchainCode, hash: string) =>
    app.rpc.chain(blockchain).eth.getTransactionReceipt(hash),
  );

  ipcMain.handle(IpcCommands.GET_ETH_TX, (event, blockchain: BlockchainCode, hash: string) =>
    app.rpc.chain(blockchain).eth.getTransaction(hash),
  );

  ipcMain.handle(IpcCommands.GET_NONCE, (event, blockchain: BlockchainCode, address: string) =>
    app.rpc.chain(blockchain).eth.getTransactionCount(address),
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

              log.info(`Broadcast transaction: ${hash}`);

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

  ipcMain.handle(IpcCommands.LOOKUP_ADDRESS, (event, blockchain: BlockchainCode, address: string) =>
    app.rpc.chain(blockchain).ethers.lookupAddress(address),
  );

  ipcMain.handle(IpcCommands.RESOLVE_NAME, (event, blockchain: BlockchainCode, name: string) =>
    app.rpc.chain(blockchain).ethers.resolveName(name),
  );

  ipcMain.handle(IpcCommands.FS_READ_FILE, async (event, filePath: string) => {
    try {
      const content = await readFile(filePath);

      return new Uint8Array(content);
    } catch (exception) {
      return null;
    }
  });
}
