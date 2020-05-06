import {
  AddressBalance,
  AnyAddress,
  Asset,
  BalanceRequest,
  BlockchainClient,
  ClientReadable,
  MultiAddress,
  SingleAddress
} from '@emeraldpay/grpc-client';
import extractChain from '../../extractChain';

interface IAccountStatusEvent {
  address: string;
  balance: string;
  asset: any;
}

type HeadListener = (status: IAccountStatusEvent) => void;

export class AddressListener {
  public client: BlockchainClient;
  public response?: ClientReadable<AddressBalance>;

  constructor (client: BlockchainClient) {
    this.client = client;
  }

  public stop () {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  public subscribe (chainCode: string, addresses: string[], handler: HeadListener) {
    const chain = extractChain(chainCode);
    const pbMultiAddr = new MultiAddress();
    addresses.forEach((it) => {
      const pbAddr = new SingleAddress();
      pbAddr.setAddress(it);
      pbMultiAddr.addAddresses(pbAddr);
    });
    const pbAnyAddr = new AnyAddress();
    pbAnyAddr.setAddressMulti(pbMultiAddr);

    const asset = new Asset();
    asset.setChain(chain.id);
    asset.setCode('Ether');
    const request = new BalanceRequest();
    request.setAsset(asset);
    request.setAddress(pbAnyAddr);

    this.client.subscribeBalance(request, (response: ClientReadable<AddressBalance>) => {
      response.on('data', (data: AddressBalance) => {
        const address = data.getAddress();
        if (handler && data && address) {
          handler({
            address: address.getAddress(),
            balance: data.getBalance(),
            asset: data.getAsset()?.getCode()
          });
        }
      });
      response.on('end', () => {
      });
      response.on('error', (err) => {
        console.warn('response error addr', err);
      });
      this.response = response;
    });
  }
}
