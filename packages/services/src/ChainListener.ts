import {
  credentials,
  BlockchainClient, ChainHead,
  ChainSpec, chainByCode
} from '@emeraldplatform/grpc';

import { TextEncoder, TextDecoder } from 'text-encoding';
import {ClientReadableStream} from 'grpc';

type ChainStatus = {
  height: number,
  hash: string
}

interface HeadListener {
  (status: ChainStatus): void;
}

export class ChainListener {
  client: BlockchainClient;
  chain: ChainSpec;
  response?: ClientReadableStream<ChainHead>;

  constructor(chain: string, host: string) {
    const cred = credentials.createInsecure();
    this.client = new BlockchainClient(host, cred);
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

  subscribe(handler: HeadListener) {
    const request = this.chain.toProtobuf();
    const response = this.client.streamHead(request);
    response.on('data', (data: ChainHead) => {
      // console.log(`New blockchain height. Chain: ${data.getChain()}, height: ${data.getHeight()}`);
      if (handler) {
        handler({height: data.getHeight(), hash: data.getHash()})
      }
    });
    response.on('end', () => {
    });
    response.on('error', (err) => {
    });
    this.response = response;
  }
}