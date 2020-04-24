import {
  AddressBookItem,
  BlockchainCode,
  Commands,
  IBackendApi,
  Wallet
} from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

/**
 * This backend api implementation calls electron IPC for business logic
 */
export default class BackendApi implements IBackendApi {
  public updateWallet = (walletId: string, name: string): Promise<boolean> => {
    return ipcRenderer.invoke(Commands.VAULT_UPDATE_WALLET, walletId, name);
  }

  public getAllWallets = (): Promise<Wallet[]> => {
    return ipcRenderer.invoke(Commands.VAULT_GET_WALLETS);
  }

  public removeAddressBookItem = (blockchain: BlockchainCode, address: string): Promise<boolean> => {
    return ipcRenderer.invoke(Commands.DELETE_ADDR_BOOK_ITEM, blockchain, address);
  }

  public addAddressBookItem = (item: AddressBookItem): Promise<boolean> => {
    return ipcRenderer.invoke(Commands.ADD_ADDR_BOOK_ITEM, item);
  }

  public getAddressBookItems = (blockchain: BlockchainCode): Promise<AddressBookItem[]> => {
    return ipcRenderer.invoke(Commands.GET_ADDR_BOOK_ITEMS, blockchain);
  }

  public getErc20Balance = (blockchain: BlockchainCode, tokenId: string, address: string): Promise<string> => {
    return ipcRenderer.invoke(Commands.ERC20_GET_BALANCE, blockchain, tokenId, address);
  }

  public getGasPrice = (blockchain: BlockchainCode): Promise<number> => {
    return ipcRenderer.invoke(Commands.GET_GAS_PRICE, blockchain);
  }

  public importEthereumJson = (
    blockchain: BlockchainCode, walletId: string, json: any
  ): Promise<any> => {
    return ipcRenderer.invoke(Commands.ACCOUNT_IMPORT_ETHEREUM_JSON,
      blockchain, walletId, json);
  }

  public importRawPrivateKey = (
    blockchain: BlockchainCode, walletId: string, privateKey: string, password: string
  ): Promise<any> => {
    return ipcRenderer.invoke(Commands.ACCOUNT_IMPORT_PRIVATE_KEY,
      blockchain, walletId, privateKey, password);
  }

  public persistTransactions = (blockchain: BlockchainCode, txs: any[]): Promise<void> => {
    const request = txs.map((tx) => ({
      ...tx,
      gasPrice: (typeof tx.gasPrice === 'string') ? tx.gasPrice : tx.gasPrice.toString(),
      value: (typeof tx.value === 'string') ? tx.value : tx.value.toString()
    }));
    return ipcRenderer.invoke(Commands.PERSIST_TX_HISTORY, blockchain, request);
  }

  public createWallet = (name: string, password: string, mnemonic: string): Promise<Wallet> => {
    return ipcRenderer.invoke(Commands.VAULT_CREATE_WALLET, name, password, mnemonic);
  }

  public getWallet = (walletId: string): Promise<Wallet> => {
    return ipcRenderer.invoke(Commands.VAULT_GET_WALLET, walletId);
  }

  public exportJsonKeyFile = (accountId: string): Promise<string> => {
    return ipcRenderer.invoke(Commands.ACCOUNT_EXPORT_JSON_FILE, accountId);
  }

  public exportRawPrivateKey = (accountId: string, password: string): Promise<string> => {
    return ipcRenderer.invoke(Commands.ACCOUNT_EXPORT_RAW_PRIVATE, accountId, password);
  }
}
