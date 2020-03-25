import { AddressBookService, Commands } from '@emeraldwallet/core';
import { loadTransactions2, storeTransactions2 } from '@emeraldwallet/history-store';
import { ipcMain } from 'electron';
import * as os from 'os';
import Application from './Application';
import { tokenContract } from './erc20';

export function setIpcHandlers (app: Application) {

  ipcMain.handle(Commands.GET_VERSION, async (event, args) => {
    const osDetails = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch()
    };
    return {
      os: osDetails
    };
  });

  ipcMain.handle(Commands.GET_APP_SETTINGS, () => {
    return app.settings.toJS();
  });

  ipcMain.handle(Commands.SET_TERMS, (event: any, v: string) => {
    app.settings.setTerms(v);
  });

  // Address Book API
  ipcMain.handle(Commands.GET_ADDR_BOOK_ITEMS, (event: any, blockchain: any) => {
    const service = new AddressBookService(app.vault!);
    const result = service.getItems(blockchain);
    return Promise.resolve(result);
  });

  ipcMain.handle(Commands.ADD_ADDR_BOOK_ITEM, (event: any, item: any) => {
    const service = new AddressBookService(app.vault!);
    const result = service.addNew(item);
    return Promise.resolve(result);
  });

  ipcMain.handle(Commands.DELETE_ADDR_BOOK_ITEM, (event: any, blockchain: any, address: any) => {
    const service = new AddressBookService(app.vault!);
    const result = service.remove(blockchain, address);
    return Promise.resolve(result);
  });

  // Transaction history API
  ipcMain.handle(Commands.PERSIST_TX_HISTORY, (event: any, blockchain: any, txs: any) => {
    storeTransactions2(blockchain, txs);
  });

  ipcMain.handle(Commands.LOAD_TX_HISTORY, (event: any, blockchain: any) => {
    return loadTransactions2(blockchain);
  });

  // ERC20
  ipcMain.handle(Commands.ERC20_GET_BALANCE, async (event: any, blockchain: any, tokenId: string, address: string) => {

    // Call Erc20 contract to request balance for address
    const data = tokenContract.functionToData('balanceOf', { _owner: address });
    return app.rpc.chain(blockchain).eth.call({ to: tokenId, data });
  });
}
