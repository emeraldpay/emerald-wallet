import {
  AddressBalance,
  AnyAddress,
  chainByCode,
  ChainSpec,
  MultiAddress,
  SingleAddress,
  BalanceRequest,
  BlockchainClient,
  Asset,
  ClientReadable
} from '@emeraldplatform/grpc';
import extractChain from "./extractChain";

type AccountStatusEvent = {
  address: string,
  balance: string,
}

interface HeadListener {
  (status: AccountStatusEvent): void;
}

export class AddressListener {
  client: BlockchainClient;
  response?: ClientReadable<AddressBalance>;

  constructor(client: BlockchainClient) {
    this.client = client;
  }

  stop() {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  subscribe(chainCode: string, addresses: string[], handler: HeadListener) {
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
    asset.setCode("Ether");
    const request = new BalanceRequest();
    request.setAsset(asset);
    request.setAddress(pbAnyAddr);

    this.client.streamBalance(request, (response: ClientReadable<AddressBalance>) => {
      response.on('data', (data: AddressBalance) => {
        let address = data.getAddress();
        if (handler && data && address) {
          handler({
            address: address.getAddress(),
            balance: data.getBalance(),
          })
        }
      });
      response.on('end', () => {
      });
      response.on('error', (err) => {
        console.warn("response error addr", err)
      });
      this.response = response;
    });
  }
}