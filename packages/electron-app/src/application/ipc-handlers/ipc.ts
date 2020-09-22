import {
  AddressBookService, AnyCoinCode,
  BlockchainCode,
  blockchainCodeToId,
  Blockchains,
  Commands, isAnyTokenCode, isCoinTickerCode, isEthereum,
  Logger,
} from '@emeraldwallet/core';
import {loadTransactions2, storeTransactions2} from '@emeraldwallet/history-store';
import {ipcMain} from 'electron';
import * as os from 'os';
import Application from '../Application';
import {tokenContract} from '../erc20';
import {registry} from "@emeraldwallet/erc20";
import BigNumber from 'bignumber.js';
import {EmeraldApiAccess} from "@emeraldwallet/services";
import {BalanceRequest, AddressBalance} from '@emeraldpay/api';

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
  ipcMain.handle(Commands.PERSIST_TX_HISTORY, (event: any, blockchain: BlockchainCode, txs: any) => {
    storeTransactions2(blockchain, txs);
  });

  ipcMain.handle(Commands.LOAD_TX_HISTORY, (event: any, blockchain: BlockchainCode) => {
    return loadTransactions2(blockchain);
  });

  ipcMain.handle(Commands.GET_BALANCE, (event: any, blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]) => {
    let blockchainId = blockchainCodeToId(blockchain);
    let calls = tokens.map((token) => {
      let req: BalanceRequest = {
        // @ts-ignore
        asset: {blockchain: blockchainId, code: token},
        address: address
      }
      return apiAccess.blockchainClient.getBalance(req);
    });
    return Promise.all(calls)
      .then((all: AddressBalance[][]) => {
        const result: { [key: string]: string } = {};
        ([] as AddressBalance[]).concat(...all)
          .forEach((balance) => {
            result[balance.asset.code] = balance.balance;
          })
        return result;
      }).catch((err) => console.warn("Failed to get balances", err));
  });

  ipcMain.handle(Commands.GET_GAS_PRICE, async (event: any, blockchain: BlockchainCode) => {
    if (isEthereum(blockchain)) {
      const gasPrice = await app.rpc.chain(blockchain).eth.gasPrice();
      return gasPrice.toNumber();
    } else {
      log.warn("No gas price for " + blockchain);
      return 0;
    }
  });

  ipcMain.handle(Commands.BROADCAST_TX, async (event: any, blockchain: BlockchainCode, tx: any) => {
    return app.rpc.chain(blockchain).eth.sendRawTransaction(tx);
  });

  ipcMain.handle(Commands.ESTIMATE_TX, (event: any, blockchain: BlockchainCode, tx: any) => {
    return app.rpc.chain(blockchain).eth.estimateGas(tx);
  });



}
