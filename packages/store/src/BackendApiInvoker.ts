import { EstimationMode } from '@emeraldpay/api';
import {
  BackendApi,
  BitcoinRawTransaction,
  BlockchainCode,
  EthereumBasicTransaction,
  EthereumRawReceipt,
  EthereumRawTransaction,
  IpcCommands,
} from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

/**
 * This backend api implementation calls electron IPC for business logic
 */
export class BackendApiInvoker implements BackendApi {
  broadcastSignedTx(blockchain: BlockchainCode, tx: string): Promise<string> {
    return ipcRenderer.invoke(IpcCommands.BROADCAST_TX, blockchain, tx);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode): Promise<any> {
    return ipcRenderer.invoke(IpcCommands.ESTIMATE_FEE, blockchain, blocks, mode);
  }

  estimateTxCost(blockchain: BlockchainCode, tx: EthereumBasicTransaction): Promise<number> {
    return ipcRenderer.invoke(IpcCommands.ESTIMATE_TX, blockchain, tx);
  }

  getBalance(blockchain: BlockchainCode, address: string, tokens: string[]): Promise<Record<string, string>> {
    return ipcRenderer.invoke(IpcCommands.GET_BALANCE, blockchain, address, tokens);
  }

  getBtcTx(blockchain: BlockchainCode, hash: string): Promise<BitcoinRawTransaction | null> {
    return ipcRenderer.invoke(IpcCommands.GET_BTC_TX, blockchain, hash);
  }

  getEthReceipt(blockchain: BlockchainCode, hash: string): Promise<EthereumRawReceipt | null> {
    return ipcRenderer.invoke(IpcCommands.GET_ETH_RECEIPT, blockchain, hash);
  }

  getEthTx(blockchain: BlockchainCode, hash: string): Promise<EthereumRawTransaction | null> {
    return ipcRenderer.invoke(IpcCommands.GET_ETH_TX, blockchain, hash);
  }

  getNonce(blockchain: BlockchainCode, address: string): Promise<number> {
    return ipcRenderer.invoke(IpcCommands.GET_NONCE, blockchain, address);
  }

  getXPubLastIndex(blockchain: BlockchainCode, xpub: string, start: number): Promise<number | undefined> {
    return ipcRenderer.invoke(IpcCommands.XPUB_LAST_INDEX, blockchain, xpub, start);
  }

  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null> {
    return ipcRenderer.invoke(IpcCommands.LOOKUP_ADDRESS, blockchain, address);
  }

  resolveName(blockchain: BlockchainCode, name: string): Promise<string | null> {
    return ipcRenderer.invoke(IpcCommands.RESOLVE_NAME, blockchain, name);
  }
}
