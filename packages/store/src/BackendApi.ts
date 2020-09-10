
import {
  BlockchainCode,
  Commands,
  IBackendApi,
  AnyCoinCode
} from '@emeraldwallet/core';
import {ipcRenderer} from 'electron';
import {SeedDescription, Wallet, AddressBookItem} from "@emeraldpay/emerald-vault-core";

/**
 * This backend api implementation calls electron IPC for business logic
 */
export default class BackendApi implements IBackendApi {
  getBalance(blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]): Promise<Record<AnyCoinCode, string>> {
    return ipcRenderer.invoke(Commands.GET_BALANCE, blockchain, address, tokens);
  }

  listSeedAddresses(seedId: string, password: string, blockchain: BlockchainCode, hdpath: string[]): Promise<Record<string, string>> {
    return ipcRenderer.invoke(Commands.VAULT_SEED_ADDRESSES, seedId, password, blockchain, hdpath);
  }

  public signTx = (accountId: string, password: string, unsignedTx: any): Promise<any> => {
    return ipcRenderer.invoke(Commands.SIGN_TX, accountId, unsignedTx, password);
  }

  public createHdAccount = (
    walletId: string, blockchain: BlockchainCode, hdPath: string, password: string
  ): Promise<string> => {
    return ipcRenderer.invoke(Commands.VAULT_CREATE_HD_ACCOUNT, walletId, blockchain, hdPath, password);
  }

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

  public broadcastSignedTx = (blockchain: BlockchainCode, tx: any): Promise<string> => {
    return ipcRenderer.invoke(Commands.BROADCAST_TX, blockchain, tx);
  }

  public estimateTxCost = (blockchain: BlockchainCode, tx: any): Promise<number> => {
    return ipcRenderer.invoke(Commands.ESTIMATE_TX, blockchain, tx);
  }

  public importEthereumJson = (
    blockchain: BlockchainCode, json: any
  ): Promise<string> => {
    return ipcRenderer.invoke(Commands.ACCOUNT_IMPORT_ETHEREUM_JSON,
      blockchain, json);
  }

  public importRawPrivateKey = (
    blockchain: BlockchainCode, privateKey: string, password: string
  ): Promise<string> => {
    return ipcRenderer.invoke(Commands.ACCOUNT_IMPORT_PRIVATE_KEY,
      blockchain, privateKey, password);
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

  public listSeeds = (): Promise<SeedDescription[]> => {
    return ipcRenderer.invoke(Commands.VAULT_GET_SEEDS);
  }
}
