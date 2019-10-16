import {
  BlockchainClient, chainByCode,
  ChainHead, CHAINS, ChainSpec,
  ClientReadable
} from '@emeraldpay/grpc-client';

import extractChain from './extractChain';

interface ChainStatus {
  height: number;
  hash: string;
}

type HeadListener = (status: ChainStatus) => void;

export class ChainListener {
  public client: BlockchainClient;
  public response?: ClientReadable<ChainHead>;

  constructor (client: BlockchainClient) {
    this.client = client;
  }

  public stop () {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  public subscribe (chainCode: string, handler: HeadListener) {
    const chain = extractChain(chainCode);
    if (chain.code == CHAINS.UNSPECIFIED.code) {
      console.warn('Unknown chain: ', chainCode, 'Ignoring.');
      return;
    }
    const request = chain.toProtobuf();
    this.client.subscribeHead(request, (response: ClientReadable<ChainHead>) => {
      response.on('data', (data: ChainHead) => {
        // console.log(`New blockchain height. Chain: ${data.getChain()}, height: ${data.getHeight()}`);
        if (handler) {
          handler({ height: data.getHeight(), hash: data.getBlockId() });
        }
      });
      this.response = response;
    });
  }
}
