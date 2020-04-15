import {
  AddressBookService,
  BlockchainCode,
  blockchainCodeToId,
  Commands,
  vault, Wallet,
  WalletService
} from '@emeraldwallet/core';
import { loadTransactions2, storeTransactions2 } from '@emeraldwallet/history-store';
import { call } from '@redux-saga/core/effects';
import { ipcMain } from 'electron';
import * as os from 'os';
import Application from '../Application';
import { tokenContract } from '../erc20';

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
  ipcMain.handle(Commands.GET_ADDR_BOOK_ITEMS, (event: any, blockchain: BlockchainCode) => {
    const service = new AddressBookService(app.vault!);
    const result = service.getItems(blockchain);
    return Promise.resolve(result);
  });

  ipcMain.handle(Commands.ADD_ADDR_BOOK_ITEM, (event: any, item: any) => {
    const service = new AddressBookService(app.vault!);
    const result = service.addNew(item);
    return Promise.resolve(result);
  });

  ipcMain.handle(Commands.DELETE_ADDR_BOOK_ITEM, (event: any, blockchain: BlockchainCode, address: any) => {
    const service = new AddressBookService(app.vault!);
    const result = service.remove(blockchain, address);
    return Promise.resolve(result);
  });

  // Transaction history API
  ipcMain.handle(Commands.PERSIST_TX_HISTORY, (event: any, blockchain: BlockchainCode, txs: any) => {
    storeTransactions2(blockchain, txs);
  });

  ipcMain.handle(Commands.LOAD_TX_HISTORY, (event: any, blockchain: BlockchainCode) => {
    return loadTransactions2(blockchain);
  });

  // ERC20
  ipcMain.handle(Commands.ERC20_GET_BALANCE,
    (event: any, blockchain: BlockchainCode, tokenId: string, address: string) => {
      // Call Erc20 contract to request balance for address
      const data = tokenContract.functionToData('balanceOf', { _owner: address });
      return app.rpc.chain(blockchain).eth.call({ to: tokenId, data });
    });

  ipcMain.handle(Commands.GET_GAS_PRICE, async (event: any, blockchain: BlockchainCode) => {
    const gasPrice = await app.rpc.chain(blockchain).eth.gasPrice();
    return gasPrice.toNumber();
  });

  ipcMain.handle(Commands.ACCOUNT_IMPORT_ETHEREUM_JSON,
    (event: any, blockchain: BlockchainCode, walletId: string, json: any) => {
      const addAccount: vault.AddAccount = {
        blockchain: blockchainCodeToId(blockchain),
        type: 'ethereum-json',
        key: JSON.stringify(json)
      };
      return app.vault?.addAccount(walletId, addAccount);
    });

  ipcMain.handle(Commands.ACCOUNT_IMPORT_PRIVATE_KEY,
    (event: any, blockchain: BlockchainCode, walletId: string, pk: string, password: string) => {
      const addAccount: vault.AddAccount = {
        blockchain: blockchainCodeToId(blockchain),
        type: 'raw-pk-hex',
        key: pk,
        password
      };
      return app.vault?.addAccount(walletId, addAccount);
    });

  // Wallets
  ipcMain.handle(Commands.VAULT_CREATE_WALLET, (event: any, name: string) => {
    const service = new WalletService(app.vault!);
    return service.createNewWallet(name);
  });

  ipcMain.handle(Commands.VAULT_GET_WALLET, (event: any, walletId: string) => {
    const service = new WalletService(app.vault!);
    return service.getWallet(walletId);
  });

  ipcMain.handle(Commands.VAULT_GET_WALLETS, (event: any) => {
    const service = new WalletService(app.vault!);
    return service.getAllWallets();
  });
}
