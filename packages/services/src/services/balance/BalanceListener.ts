import { AddressBalance, AnyAsset, BalanceRequest, Publisher, Utxo } from '@emeraldpay/api';
import { BlockchainClient } from '@emeraldpay/api-node';
import { BlockchainCode, EthereumAddress, Logger, blockchainCodeToId, isBitcoin } from '@emeraldwallet/core';

interface AddressEvent {
  address: string;
  balance: string;
  asset: AnyAsset;
  utxo?: Utxo[];
}

type Handler = (event: AddressEvent) => void;

const log = Logger.forCategory('BalanceListener');

export class BalanceListener {
  readonly client: BlockchainClient;

  response: Publisher<AddressBalance> | null = null;

  constructor(client: BlockchainClient) {
    this.client = client;
  }

  getBalance(blockchain: BlockchainCode, address: string, asset: string): Promise<AddressBalance[]> {
    const request: BalanceRequest = this.makeRequest(blockchain, address, asset);

    return this.client.getBalance(request);
  }

  subscribe(blockchain: BlockchainCode, address: string, asset: string, handler: Handler): void {
    this.stop();

    const request: BalanceRequest = this.makeRequest(blockchain, address, asset);

    this.response = this.client
      .subscribeBalance(request)
      .onData(handler)
      .onError((error) => log.error(`Error while subscribing for ${address}`, error));
  }

  stop(): void {
    this.response?.cancel();
    this.response = null;
  }

  private makeRequest(blockchain: BlockchainCode, address: string, asset: string): BalanceRequest {
    const blockchainId = blockchainCodeToId(blockchain);

    let subscriptionAsset: AnyAsset;

    if (EthereumAddress.isValid(asset)) {
      subscriptionAsset = {
        blockchain: blockchainId,
        contractAddress: asset,
      };
    } else {
      subscriptionAsset = {
        blockchain: blockchainId,
        code: asset,
      };
    }

    return {
      address,
      asset: subscriptionAsset,
      includeUtxo: isBitcoin(blockchain),
    };
  }
}
