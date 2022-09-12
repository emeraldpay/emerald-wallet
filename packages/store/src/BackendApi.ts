import { EstimationMode } from '@emeraldpay/api';
import {
  AnyCoinCode,
  BlockchainCode,
  Commands,
  EthereumRawReceipt,
  EthereumRawTransaction,
  IBackendApi,
} from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

/**
 * This backend api implementation calls electron IPC for business logic
 */
export default class BackendApi implements IBackendApi {
  broadcastSignedTx(blockchain: BlockchainCode, tx: string): Promise<string> {
    return ipcRenderer.invoke(Commands.BROADCAST_TX, blockchain, tx);
  }

  estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode): Promise<any> {
    return ipcRenderer.invoke(Commands.ESTIMATE_FEE, blockchain, blocks, mode);
  }

  estimateTxCost(blockchain: BlockchainCode, tx: any): Promise<number> {
    return ipcRenderer.invoke(Commands.ESTIMATE_TX, blockchain, tx);
  }

  getBalance(blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]): Promise<Record<AnyCoinCode, string>> {
    return ipcRenderer.invoke(Commands.GET_BALANCE, blockchain, address, tokens);
  }

  getNonce(blockchain: BlockchainCode, address: string): Promise<number> {
    return ipcRenderer.invoke(Commands.GET_NONCE, blockchain, address);
  }

  getEthReceipt(blockchain: BlockchainCode, hash: string): Promise<EthereumRawReceipt | null> {
    return ipcRenderer.invoke(Commands.GET_ETH_RECEIPT, blockchain, hash);
  }

  getEthTx(blockchain: BlockchainCode, hash: string): Promise<EthereumRawTransaction | null> {
    return ipcRenderer.invoke(Commands.GET_ETH_TX, blockchain, hash);
  }

  getXPubLastIndex(blockchain: BlockchainCode, xpub: string): Promise<number> {
    return ipcRenderer.invoke(Commands.XPUB_LAST_INDEX, blockchain, xpub);
  }
}
