import { address as AddressApi, AddressBalance, AnyAsset, EstimationMode } from '@emeraldpay/api';
import {
  BackendApi,
  BitcoinRawTransaction,
  BlockchainCode,
  EthereumRawReceipt,
  EthereumRawTransaction,
  blockchainIdToCode,
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

  estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode): Promise<number> {
    switch (mode) {
      case 'avgLast':
        return Promise.resolve(1000);
      case 'avgMiddle':
        return Promise.resolve(3000);
      case 'avgTail5':
        return Promise.resolve(1500);
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
