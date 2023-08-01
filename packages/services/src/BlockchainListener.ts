import { ChainHead, Publisher } from '@emeraldpay/api';
import { BlockchainClient } from '@emeraldpay/api-node';
import { BlockchainCode, Logger, blockchainCodeToId } from '@emeraldwallet/core';

interface ChainStatus {
  height: number;
  hash: string;
}

type HeadListener = (status: ChainStatus) => void;

const log = Logger.forCategory('BlockchainListener');

export class BlockchainListener {
  private client: BlockchainClient;

  private response: Publisher<ChainHead> | null = null;

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
      .onError((error) => log.error(`Error while subscribing to blockchain ${blockchain}:`, error));
  }
}
