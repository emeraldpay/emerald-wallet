import { ChainHead, Publisher } from '@emeraldpay/api';
import { BlockchainClient } from '@emeraldpay/api-node';
import { BlockchainCode, Logger, blockchainCodeToId } from '@emeraldwallet/core';

interface ChainStatus {
  height: number;
  hash: string;
}

type HeadListener = (status: ChainStatus) => void;

const log = Logger.forCategory('ChainListener');

export class ChainListener {
  private client: BlockchainClient;

  private response: Publisher<ChainHead> | null = null;

  private readonly restartTimeout = 5;

  constructor(client: BlockchainClient) {
    this.client = client;
  }

  stop(): void {
    this.response?.cancel();
    this.response = null;
  }

  subscribe(blockchain: BlockchainCode, handler: HeadListener): void {
    this.response = this.client
      .subscribeHead(blockchainCodeToId(blockchain))
      .onData((data) => handler({ height: data.height, hash: data.blockId }))
      .onError((error) => log.error(`Error while subscribing to blockchain ${blockchain}:`, error))
      .finally(() => {
        log.info(
          `Subscription to blocks on ${blockchain} blockchain is closed,`,
          `restart after ${this.restartTimeout} seconds...`,
        );

        setTimeout(() => this.subscribe(blockchain, handler), this.restartTimeout * 1000);
      });
  }
}
