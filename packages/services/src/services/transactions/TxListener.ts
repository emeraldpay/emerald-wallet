import {
  BlockchainClient,
  TxStatus,
  TxStatusRequest
} from '@emeraldpay/api-client-node';
import extractChain from '../../extractChain';
import {Logger} from "@emeraldwallet/core";
import {Publisher} from '@emeraldpay/api-client-core';

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
  public response?: Publisher<TxStatus>;

  constructor(client: BlockchainClient) {
    this.client = client;
  }

  public stop() {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  public subscribe (chainCode: string, hash: string, handler: TxStatusHandler) {
    const chain = extractChain(chainCode);
    const request = new TxStatusRequest();
    request.setChain(chain.id);
    request.setTxId(hash);
    request.setConfirmationLimit(12);

    let results = this.client.subscribeTxStatus(request);
    this.response = results.onData((data) => {
      const block = data.getBlock();
      if (handler) {
        let event = {
          txid: data.getTxId(),
          broadcasted: data.getBroadcasted(),
          mined: data.getMined(),
          confirmations: data.getConfirmations()
        };
        if (block) {
          const blockInfo = {
            blockHash: block.getBlockId(),
            blockNumber: block.getHeight(),
            timestamp: block.getTimestamp()
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
        console.warn('response error tx', err);
      });
  }
}
