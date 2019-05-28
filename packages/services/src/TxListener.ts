import {
  chainByCode,
  ChainSpec,
  credentials,
  TrackTxRequest,
  TrackClient,
  TxStatus
} from '@emeraldplatform/grpc';
import * as grpc from 'grpc';
import {ClientReadableStream} from 'grpc';

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
  client: TrackClient;
  chain: ChainSpec;
  response?: ClientReadableStream<TxStatus>;

  constructor(chain: string, host: string) {
    const cred = credentials.createInsecure();
    this.client = new TrackClient(host, cred);
    if (chain === 'mainnet') {
      chain = 'etc';
    }
    this.chain = chainByCode(chain.toUpperCase());
  }

  stop() {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  subscribe(hash: string, handler: TxStatusHandler) {
    const request = new TrackTxRequest();
    request.setChain(this.chain.id);
    request.setId(Uint8Array.from(Buffer.from(hash.substring(2), 'hex')));
    request.setConfirmations(12);

    this.client.trackTx(request, (response: grpc.ClientReadableStream<TxStatus>) => {
      response.on('data', (data: TxStatus) => {
        if (handler) {
          handler({
            txid: '0x' + Buffer.from(data.getId_asU8()).toString('hex'),
            broadcasted: data.getBroadcasted(),
            mined: data.getMined(),
            blockHash: Buffer.from(data.getBlockhash_asU8()).toString('hex'),
            blockNumber: data.getBlockheight(),
            timestamp: data.getBlocktimestamp(),
            confirmations: data.getConfirmations(),
          })
        }
      });
      response.on('end', () => {
      });
      response.on('error', (err) => {
        console.warn("response error", err)
      });
      this.response = response;
    });
  }
}