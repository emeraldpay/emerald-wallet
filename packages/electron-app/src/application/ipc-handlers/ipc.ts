import {
  AddressBalance,
  AssetCode,
  Blockchain,
  EstimationMode,
  isNativeCallError,
  isNativeCallResponse,
} from '@emeraldpay/api';
import {
  amountFactory,
  AnyCoinCode,
  BlockchainCode,
  blockchainCodeToId,
  Commands,
  isBitcoin,
  isEthereum,
  IStoredTransaction,
  Logger,
} from '@emeraldwallet/core';
import { loadTransactions2, storeTransactions2 } from '@emeraldwallet/history-store';
import { EmeraldApiAccess } from "@emeraldwallet/services";
import { ipcMain } from 'electron';
import * as os from 'os';
import Application from '../Application';

interface BalanceResult {
  asset: AnyCoinCode;
  balance: string;
}

const log = Logger.forCategory('IPC Handlers');

export function setIpcHandlers(app: Application, apiAccess: EmeraldApiAccess) {

  ipcMain.handle(Commands.GET_VERSION, async (event, args) => {
    const osDetails = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch()
    };
    return {
      os: osDetails,
      version: app.versions?.version,
      gitVersion: app.versions?.gitVersion
    };
  });

  ipcMain.handle(Commands.GET_APP_SETTINGS, () => {
    return app.settings.toJS();
  });

  ipcMain.handle(Commands.SET_TERMS, (event: any, v: string) => {
    app.settings.setTerms(v);
  });

  // Transaction history API
  ipcMain.handle(Commands.PERSIST_TX_HISTORY, (event: any, blockchain: BlockchainCode, txs: IStoredTransaction[]) => {
    storeTransactions2(blockchain, txs);
  });

  ipcMain.handle(Commands.LOAD_TX_HISTORY, (event: any, blockchain: BlockchainCode) => {
    return loadTransactions2(blockchain);
  });

  ipcMain.handle(Commands.GET_BALANCE, (event: any, blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]) => {
    const addressListener = apiAccess.newAddressListener();
    const amountReader = amountFactory(blockchain);
    let calls: Promise<AddressBalance[]>[] = [];
    tokens.forEach((token) => {
      let asset = token as AssetCode;
      if (asset.toLowerCase() === "TESTBTC") {
        // it always BTC for bitcoin networks, TESTBTC is our internal code
        asset = "BTC"
      }
      let p = addressListener.getBalance(blockchain, address, asset);
      calls.push(p)
    });
    return Promise.all(calls)
      .then((all: AddressBalance[][]) => {
        const result: { [key: string]: string } = {};
        ([] as AddressBalance[]).concat(...all)
          .forEach((balance) => {
            let code = balance.asset.code as AnyCoinCode;
            if (code == "BTC" && balance.asset.blockchain == Blockchain.TESTNET_BITCOIN) {
              code = "TESTBTC";
            }
            result[code] = amountReader(balance.balance).encode();
          })
        return result;
      }).catch((err) => console.warn("Failed to get balances", err));
  });

  ipcMain.handle(Commands.GET_GAS_PRICE, async (event: any, blockchain: BlockchainCode) => {
    if (isEthereum(blockchain)) {
      const gasPrice = await app.rpc.chain(blockchain).eth.gasPrice();
      return gasPrice.toNumber();
    } else {
      log.debug("No gas price for " + blockchain);
      return 0;
    }
  });

  ipcMain.handle(Commands.BROADCAST_TX, async (event: any, blockchain: BlockchainCode, tx: string) => {
    if (isEthereum(blockchain)) {
      return app.rpc.chain(blockchain).eth.sendRawTransaction(tx);
    } else if (isBitcoin(blockchain)) {
      return new Promise((resolve, reject) => {
        apiAccess.blockchainClient.nativeCall(
          blockchainCodeToId(blockchain),
          [
            {
              id: 0,
              method: "sendrawtransaction",
              payload: [tx]
            }
          ]
        ).onData((resp) => {
          if (isNativeCallResponse(resp)) {
            const hash = resp.payload as string;
            log.info("Broadcast transaction: " + hash);
            resolve(hash);
          } else if (isNativeCallError(resp)) {
            reject(resp.message);
          } else {
            reject("Invalid response from API");
          }
        }).onError((err) => reject(err.message));
      })
    } else {
      log.error("Invalid blockchain: " + blockchain)
    }
  });

  ipcMain.handle(Commands.ESTIMATE_TX, (event: any, blockchain: BlockchainCode, tx: any) => {
    return app.rpc.chain(blockchain).eth.estimateGas(tx);
  });

  ipcMain.handle(Commands.GET_NONCE, (event: any, blockchain: BlockchainCode, address: string) => {
    return app.rpc.chain(blockchain).eth.getTransactionCount(address)
  });

  ipcMain.handle(
    Commands.ESTIMATE_FEE,
    async (
      event: any,
      blockchain: BlockchainCode,
      blocks: number,
      mode: EstimationMode,
    ) => {
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
            return fee.expect;
          case 'ethereumStd':
            return fee.fee;
        }
      } catch (exception) {
        log.error('Cannot estimate fee: ', exception.message);
      }

      return null;
    },
  );
}
