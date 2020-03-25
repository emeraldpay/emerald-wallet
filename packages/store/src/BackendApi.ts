import { AddressBookItem, BlockchainCode, Commands, IBackendApi, Wallet } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

/**
 * This backend api implementation calls electron IPC for business logic
 */
export default class BackendApi implements IBackendApi {

  public getAllWallets = (): Promise<Wallet[]> => {
    return Promise.resolve([]);
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
}
