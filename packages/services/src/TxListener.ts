import {
  chainByCode,
  ChainSpec,
  TrackTxRequest,
  BlockchainClient,
  TxStatus
} from '@emeraldplatform/grpc';
import * as grpc from 'grpc';
import {ChannelCredentials, ClientReadableStream} from 'grpc';
import extractChain from "./extractChain";

type TxStatusEvent = {
  txid: string,
  broadcasted: boolean,
  mined: boolean,
  blockHash: string,
  blockNumber: number,
  timestamp: number,
  confirmations: number
}

interface TxStatusHandler {
  (status: TxStatusEvent): void;
}

export class TxListener {
  client: BlockchainClient;
  response?: ClientReadableStream<TxStatus>;

  constructor(client: BlockchainClient) {
    this.client = client;
  }

  stop() {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  subscribe(chainCode: string, hash: string, handler: TxStatusHandler) {
    const chain = extractChain(chainCode);
    const request = new TrackTxRequest();
    request.setChain(chain.id);
    request.setTxid(hash);
    request.setConfirmations(12);

    this.client.trackTx(request, (response: grpc.ClientReadableStream<TxStatus>) => {
      response.on('data', (data: TxStatus) => {
        const block = data.getBlock();
        if (handler && block) {
          handler({
            txid: data.getTxid(),
            broadcasted: data.getBroadcasted(),
            mined: data.getMined(),
            blockHash: Buffer.from(block.getHash_asU8()).toString('hex'),
            blockNumber: block.getHeight(),
            timestamp: block.getTimestamp(),
            confirmations: data.getConfirmations(),
          })
        }
      });
      response.on('end', () => {
      });
      response.on('error', (err) => {
        console.warn("response error tx", err)
      });
      this.response = response;
    });
  }
}