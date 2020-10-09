import {
  BlockchainClient
} from '@emeraldpay/api-node';
import {BlockchainCode, blockchainCodeToId, isBitcoin, Logger} from "@emeraldwallet/core";
import {Publisher, TxStatusResponse} from '@emeraldpay/api';

interface ITxStatusEvent {
  txid: string;
  broadcasted?: boolean;
  mined?: boolean;
  blockHash?: string;
  blockNumber?: number;
  timestamp?: number;
  confirmations?: number;
}

type TxStatusHandler = (status: ITxStatusEvent) => void;

const log = Logger.forCategory('TxListener');

export class TxListener {
  public client: BlockchainClient;
  public response?: Publisher<TxStatusResponse>;

  constructor(client: BlockchainClient) {
    this.client = client;
  }

  public stop() {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  public subscribe(chainCode: BlockchainCode, hash: string, handler: TxStatusHandler) {
    const request = this.client.subscribeTxStatus({
      blockchain: blockchainCodeToId(chainCode),
      txid: hash,
      limit: isBitcoin(chainCode) ? 3 : 12
    });
    this.response = request
      .onData((data) => {
        if (handler) {
          let event = {
            txid: data.txid,
            broadcasted: data.broadcast,
            mined: data.mined,
            confirmations: data.confirmations
          };
          const block = data.block;
          if (data.mined && block) {
            const blockInfo = {
              blockHash: block.hash,
              blockNumber: block.height,
              timestamp: block.timestamp
            };
            event = {...event, ...blockInfo};
          }
          handler(event);
        }
      })
      .finally(() => {
        if (handler) {
          handler({
            txid: hash
          });
        }
      })
      .onError((err) => {
        log.warn('response error tx', err);
      });
  }
}
