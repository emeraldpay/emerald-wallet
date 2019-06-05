import {
  AddressStatus,
  AnyAddress,
  chainByCode,
  ChainSpec,
  MultiAddress,
  SingleAddress,
  TrackAddressRequest,
  BlockchainClient,
  Asset
} from '@emeraldplatform/grpc';
import BigNumber from 'bignumber.js';
import * as grpc from 'grpc';
import {ChannelCredentials, ClientReadableStream} from 'grpc';

type AccountStatusEvent = {
  address: string,
  balance: string,
}

interface HeadListener {
  (status: AccountStatusEvent): void;
}

export class AddressListener {
  client: BlockchainClient;
  chain: ChainSpec;
  response?: ClientReadableStream<AddressStatus>;

  constructor(chain: string, client: BlockchainClient) {
    this.client = client;
    if (chain === 'mainnet') {
      chain = 'etc';
    }
    this.chain = chainByCode(chain.toUpperCase());
  }

  stop() {
    if (this.response) {
      this.response.cancel();
    }
    this.response = undefined;
  }

  subscribe(addresses: string[], handler: HeadListener) {
    const pbMultiAddr = new MultiAddress();
    addresses.forEach((it) => {
      const pbAddr = new SingleAddress();
      pbAddr.setAddress(it);
      pbMultiAddr.addAddresses(pbAddr);
    });
    const pbAnyAddr = new AnyAddress();
    pbAnyAddr.setAddressMulti(pbMultiAddr);

    const asset = new Asset();
    asset.setChain(this.chain.id);
    asset.setCode("Ether");
    const request = new TrackAddressRequest();
    request.setAsset(asset);
    request.setAddress(pbAnyAddr);
    request.setIncludeTransactions(false);

    this.client.trackAddress(request, (response: grpc.ClientReadableStream<AddressStatus>) => {
      response.on('data', (data: AddressStatus) => {
        let address = data.getAddress();
        if (handler && data && address) {
          handler({
            address: address.getAddress(),
            balance: new BigNumber(Buffer.from(data.getBalance_asU8()).toString('hex'), 16).toString()
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