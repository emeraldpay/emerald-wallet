import { EstimationMode } from '@emeraldpay/api';
import { Wei } from '@emeraldpay/bigamount-crypto';
import {
  AnyCoinCode,
  BlockchainCode,
  Commands,
  EthereumStoredTransaction,
  IBackendApi,
  isBitcoin,
  isEthereumStoredTransaction,
  IStoredTransaction,
} from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';

/**
 * This backend api implementation calls electron IPC for business logic
 */
export default class BackendApi implements IBackendApi {
  getBalance(blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]): Promise<Record<AnyCoinCode, string>> {
    return ipcRenderer.invoke(Commands.GET_BALANCE, blockchain, address, tokens);
  }

  public broadcastSignedTx = (blockchain: BlockchainCode, tx: string): Promise<string> => {
    return ipcRenderer.invoke(Commands.BROADCAST_TX, blockchain, tx);
  };

  public estimateTxCost = (blockchain: BlockchainCode, tx: any): Promise<number> => {
    return ipcRenderer.invoke(Commands.ESTIMATE_TX, blockchain, tx);
  };

  public persistTransactions = (blockchain: BlockchainCode, txs: IStoredTransaction[]): Promise<void> => {
    if (isBitcoin(blockchain)) {
      return ipcRenderer.invoke(Commands.PERSIST_TX_HISTORY, blockchain, txs);
    }

    const request = txs
      .filter((tx) => isEthereumStoredTransaction(tx))
      .map((tx) => tx as EthereumStoredTransaction)
      .map((tx) => {
        let gasPrices: Record<'gasPrice', string> | Record<'maxGasPrice' | 'priorityGasPrice', string>;

        if (tx.gasPrice == null) {
          const maxGasPrice =
            typeof tx.maxGasPrice === 'string' ? tx.maxGasPrice : new Wei(tx.maxGasPrice ?? 0).number.toString();
          const priorityGasPrice =
            typeof tx.priorityGasPrice === 'string'
              ? tx.priorityGasPrice
              : new Wei(tx.priorityGasPrice ?? 0).number.toString();

          gasPrices = {
            maxGasPrice,
            priorityGasPrice,
          };
        } else {
          const gasPrice = typeof tx.gasPrice === 'string' ? tx.gasPrice : new Wei(tx.gasPrice).number.toString();

          gasPrices = { gasPrice };
        }

        return {
          ...tx,
          ...gasPrices,
          value: typeof tx.value === 'string' ? tx.value : tx.value.toString(),
        };
      });

    return ipcRenderer.invoke(Commands.PERSIST_TX_HISTORY, blockchain, request);
  };

  public getNonce = (blockchain: BlockchainCode, address: string): Promise<number> => {
    return ipcRenderer.invoke(Commands.GET_NONCE, blockchain, address);
  };

  public estimateFee = (blockchain: BlockchainCode, blocks: number, mode: EstimationMode): Promise<any> => {
    return ipcRenderer.invoke(Commands.ESTIMATE_FEE, blockchain, blocks, mode);
  };
}
