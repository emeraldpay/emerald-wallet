import {
  BlockchainClient,
} from '@emeraldpay/api-node';
import {
  BalanceRequest, AddressBalance, Publisher, Utxo
} from '@emeraldpay/api';
import {BlockchainCode, blockchainCodeToId, isBitcoin, isEthereum} from "@emeraldwallet/core";
import {AssetCode} from "@emeraldpay/api/lib/typesCommon";

interface IAccountStatusEvent {
  address: string;
  balance: string;
  asset: string;
  utxo?: Utxo[] | undefined
}

type HeadListener = (status: IAccountStatusEvent) => void;

export class AddressListener {
  public client: BlockchainClient;
  public response?: Publisher<AddressBalance>;

  constructor (client: BlockchainClient) {
    this.client = client;
  }

  public stop() {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  public makeRequest(chainCode: BlockchainCode, addresses: string | string[], token?: AssetCode): BalanceRequest {
    const isEthereumChain = isEthereum(chainCode);
    const isBitcoinChain = isBitcoin(chainCode);
    return {
      address: addresses,
      asset: {
        blockchain: blockchainCodeToId(chainCode),
        code: isEthereumChain ?
          (token || "ETHER") : "BTC",
      },
      includeUtxo: isBitcoinChain
    }
  }

  public getBalance(chainCode: BlockchainCode, addresses: string | string[], token?: AssetCode): Promise<AddressBalance[]> {
    const request: BalanceRequest = this.makeRequest(chainCode, addresses);
    return this.client.getBalance(request);
  }

  public subscribe(chainCode: BlockchainCode, addresses: string | string[], token: AssetCode | undefined, handler: HeadListener) {
    const request: BalanceRequest = this.makeRequest(chainCode, addresses, token);

    this.response = this.client.subscribeBalance(request)
      .onData((data) => {
        const address = data.address;
        if (handler && data && address) {
          handler({
            address,
            balance: data.balance,
            asset: data.asset.code,
            utxo: data.utxo
          });
        }
      })
      .onError((err) => {
        console.warn('response error addr', err);
      });
  }

}
