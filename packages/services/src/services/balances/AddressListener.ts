import {
  BlockchainClient,
} from '@emeraldpay/api-client-node';
import {
  BalanceRequest, AddressBalance, Publisher
} from '@emeraldpay/api-client-core';
import {BlockchainCode, blockchainCodeToId} from "@emeraldwallet/core";

interface IAccountStatusEvent {
  address: string;
  balance: string;
  asset: any;
}

type HeadListener = (status: IAccountStatusEvent) => void;

export class AddressListener {
  public client: BlockchainClient;
  public response?: Publisher<AddressBalance>;

  constructor (client: BlockchainClient) {
    this.client = client;
  }

  public stop () {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  public subscribe(chainCode: BlockchainCode, addresses: string[], handler: HeadListener) {

    const request: BalanceRequest = {
      address: addresses,
      asset: {
        blockchain: blockchainCodeToId(chainCode),
        code: "ETHER"
      }
    };


    this.response = this.client.subscribeBalance(request)
      .onData((data) => {
        const address = data.address;
        if (handler && data && address) {
          handler({
            address,
            balance: data.balance,
            asset: data.asset.code
          });
        }
      })
      .onError((err) => {
        console.warn('response error addr', err);
      });
  }

}
