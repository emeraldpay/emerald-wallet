import { AddressBalance, AssetCode, BalanceRequest, Publisher, Utxo } from '@emeraldpay/api';
import { BlockchainClient } from '@emeraldpay/api-node';
import { BlockchainCode, Logger, blockchainCodeToId, isBitcoin, isEthereum, Blockchains } from '@emeraldwallet/core';

interface IAccountStatusEvent {
  address: string;
  balance: string;
  asset: string;
  utxo?: Utxo[];
}

type HeadListener = (status: IAccountStatusEvent) => void;

const log = Logger.forCategory('AddressService');

export class AddressListener {
  public client: BlockchainClient;

  public response: Publisher<AddressBalance> | null = null;

  constructor(client: BlockchainClient) {
    this.client = client;
  }

  stop(): void {
    this.response?.cancel();
    this.response = null;
  }

  getBalance(blockchain: BlockchainCode, addresses: string | string[], token?: AssetCode): Promise<AddressBalance[]> {
    const request: BalanceRequest = this.makeRequest(blockchain, addresses, token);

    return this.client.getBalance(request);
  }

  subscribe(chainCode: BlockchainCode, addresses: string | string[], handler: HeadListener, token?: AssetCode): void {
    const request: BalanceRequest = this.makeRequest(chainCode, addresses, token);

    this.response = this.client
      .subscribeBalance(request)
      .onData(({ address, asset, balance, utxo }) => handler({ address, balance, utxo, asset: asset.code }))
      .onError((error) => {
        const addressesList = Array.isArray(addresses) ? addresses.join(', ') : addresses;

        log.warn(`Error while subscribing for addresses ${addressesList}`, error);
      });
  }

  private makeRequest(blockchainCode: BlockchainCode, addresses: string | string[], token?: AssetCode): BalanceRequest {
    const { coin } = Blockchains[blockchainCode].params;

    return {
      address: addresses,
      asset: {
        blockchain: blockchainCodeToId(blockchainCode),
        code: isEthereum(blockchainCode) ? token ?? coin : coin,
      },
      includeUtxo: isBitcoin(blockchainCode),
    };
  }
}
