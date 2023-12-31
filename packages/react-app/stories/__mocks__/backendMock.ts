import { address as AddressApi, AddressBalance, AnyAsset, EstimationMode } from '@emeraldpay/api';
import {
  BackendApi,
  BitcoinRawTransaction,
  BlockchainCode,
  EthereumRawReceipt,
  EthereumRawTransaction,
  blockchainIdToCode,
  isBitcoin,
} from '@emeraldwallet/core';

export class BlockchainMock {
  balances: Record<string, Record<string, string>> = {};

  setBalance(address: string, asset: string, balance: string): void {
    if (this.balances[address] == null) {
      this.balances[address] = {};
    }

    this.balances[address][asset] = balance;
  }
}

export class BackendMock implements BackendApi {
  readonly blockchains: Partial<Record<BlockchainCode, BlockchainMock>> = {};

  useBlockchains(blockchains: BlockchainCode[]): void {
    blockchains.forEach((blockchain) => {
      this.blockchains[blockchain] = new BlockchainMock();
    });
  }

  broadcastSignedTx(): Promise<string> {
    return Promise.resolve('');
  }

  describeAddress(blockchain: BlockchainCode, address: string): Promise<AddressApi.DescribeResponse> {
    return Promise.resolve({
      address,
      active: true,
      capabilities: [],
      control: AddressApi.AddressControl.PERSON,
    });
  }

  estimateFee(
    blockchain: BlockchainCode,
    blocks: number,
    mode: EstimationMode,
  ): Promise<number | Record<string, string>> {
    switch (mode) {
      case 'avgLast':
        return Promise.resolve(
          isBitcoin(blockchain)
            ? 1000
            : {
                max: '100000000000',
                priority: '1000000',
              },
        );
      case 'avgTail5':
        return Promise.resolve(
          isBitcoin(blockchain)
            ? 2000
            : {
                max: '200000000000',
                priority: '2000000',
              },
        );
      case 'avgMiddle':
        return Promise.resolve(
          isBitcoin(blockchain)
            ? 3000
            : {
                max: '300000000000',
                priority: '3000000',
              },
        );
    }

    return Promise.resolve(0);
  }

  estimateTxCost(): Promise<number> {
    return Promise.resolve(0);
  }

  getBalance(address: string, asset: AnyAsset): Promise<AddressBalance[]> {
    const state = this.blockchains[blockchainIdToCode(asset.blockchain)];

    if (state == null) {
      return Promise.resolve([]);
    }

    const result: AddressBalance[] = [];

    const { [address]: balances } = state.balances;

    if (balances != null) {
      Object.keys(balances).forEach((balanceAsset) => {
        result.push({
          address,
          asset,
          balance: balances[balanceAsset],
        });
      });
    }

    return Promise.resolve(result);
  }

  getEthReceipt(): Promise<EthereumRawReceipt | null> {
    return Promise.resolve(null);
  }

  getBtcTx(): Promise<BitcoinRawTransaction | null> {
    return Promise.resolve(null);
  }

  getEthTx(): Promise<EthereumRawTransaction | null> {
    return Promise.resolve(null);
  }

  getNonce(): Promise<number> {
    return Promise.resolve(0);
  }

  getXPubLastIndex(): Promise<number | undefined> {
    return Promise.resolve(1);
  }

  lookupAddress(): Promise<string> {
    return Promise.resolve('address.eth');
  }

  resolveName(): Promise<string> {
    return Promise.resolve('0x0');
  }
}
