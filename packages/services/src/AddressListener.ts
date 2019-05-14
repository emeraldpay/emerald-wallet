import {
  credentials,
  MultiAddress, SingleAddress, AnyAddress, TrackClient, AccountStatus, TrackAccountRequest,
  ChainSpec, chainByCode
} from '@emeraldplatform/grpc';
import BigNumber from 'bignumber.js';
import { TextEncoder, TextDecoder } from 'text-encoding';
import {ClientReadableStream} from 'grpc';

type AccountStatusEvent = {
  address: string,
  balance: string,
}

interface HeadListener {
  (status: AccountStatusEvent): void;
}

export class AddressListener {
  client: TrackClient;
  chain: ChainSpec;
  response?: ClientReadableStream<AccountStatus>;

  constructor(chain: string, host: string) {
    const cred = credentials.createInsecure();
    this.client = new TrackClient(host, cred);
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
      pbAddr.setAddress(Uint8Array.from(Buffer.from(it.substring(2), 'hex')));
      pbMultiAddr.addAddresses(pbAddr);
    });
    const pbAnyAddr = new AnyAddress();
    pbAnyAddr.setAddressMulti(pbMultiAddr);

    const request = new TrackAccountRequest();
    request.setChain(this.chain.id);
    request.setAddress(pbAnyAddr);
    request.setTransactions(false);

    const response = this.client.trackAccount(request);
    response.on('data', (data: AccountStatus) => {
      if (handler) {
        handler({
          address: '0x'+Buffer.from(data.getAddress_asU8()).toString('hex'),
          balance: new BigNumber(Buffer.from(data.getBalance_asU8()).toString('hex'), 16).toString()
        })
      }
    });
    response.on('end', () => {
    });
    response.on('error', (err) => {
    });
    this.response = response;
  }
}