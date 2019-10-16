import {
  BlockchainClient,
  ClientReadable,
  TxStatus,
  TxStatusRequest
} from '@emeraldplatform/grpc';
import extractChain from '../extractChain';

interface TxStatusEvent {
  txid: string;
  broadcasted?: boolean;
  mined?: boolean;
  blockHash?: string;
  blockNumber?: number;
  timestamp?: number;
  confirmations?: number;
}

type TxStatusHandler = (status: TxStatusEvent) => void;

export class TxListener {
  public client: BlockchainClient;
  public response?: ClientReadable<TxStatus>;

  constructor (client: BlockchainClient) {
    this.client = client;
  }

  public stop () {
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

    this.client.subscribeTxStatus(request, (response: ClientReadable<TxStatus>) => {
      response.on('data', (data: TxStatus) => {
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
            event = { ...event, ...blockInfo };
          }
          handler(event);
        }
      });
      response.on('end', () => {
        if (handler) {
          handler({
            txid: hash
          });
        }
      });
      response.on('error', (err) => {
        console.warn('response error tx', err);
      });
      this.response = response;
    });
  }
}
