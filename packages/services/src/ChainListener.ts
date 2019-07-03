import {
  BlockchainClient, ChainHead,
  ChainSpec, chainByCode
} from '@emeraldplatform/grpc';

import {ChannelCredentials, ClientReadableStream} from 'grpc';
import * as grpc from "grpc";
import extractChain from "./extractChain";

type ChainStatus = {
  height: number,
  hash: string
}

interface HeadListener {
  (status: ChainStatus): void;
}

export class ChainListener {
  client: BlockchainClient;
  response?: ClientReadableStream<ChainHead>;

  constructor(client: BlockchainClient) {
    this.client = client;
  }

  stop() {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  subscribe(chainCode: string, handler: HeadListener) {
    const chain = extractChain(chainCode);
    const request = chain.toProtobuf();
    this.client.streamHead(request, (response: grpc.ClientReadableStream<ChainHead>) => {
      response.on('data', (data: ChainHead) => {
        // console.log(`New blockchain height. Chain: ${data.getChain()}, height: ${data.getHeight()}`);
        if (handler) {
          handler({height: data.getHeight(), hash: data.getBlockId()})
        }
      });
      this.response = response;
    })
  }
}
