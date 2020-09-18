import {
  BlockchainClient
} from '@emeraldpay/api-client-node';

import {BlockchainCode, blockchainCodeToId, Logger} from "@emeraldwallet/core";
import {Publisher, ChainHead} from '@emeraldpay/api-client-core';

interface ChainStatus {
  height: number;
  hash: string;
}

type HeadListener = (status: ChainStatus) => void;

const log = Logger.forCategory('ChainListener');

export class ChainListener {
  public client: BlockchainClient;
  public response?: Publisher<ChainHead>;

  constructor(client: BlockchainClient) {
    this.client = client;
  }

  public stop() {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  public subscribe(chainCode: BlockchainCode, handler: HeadListener) {
    this.response = this.client.subscribeHead(blockchainCodeToId(chainCode))
      .onData((data) => {
        // console.log(`New blockchain height. Chain: ${data.getChain()}, height: ${data.getHeight()}`);
        if (handler) {
          handler({height: data.height, hash: data.blockId});
        }
      })
      .onError((err) => {
        log.error("Connection error", err);
      })
      .finally(() => {
        log.warn("Subscription to blocks on " + chainCode + " is closed");
      });
  }
}
