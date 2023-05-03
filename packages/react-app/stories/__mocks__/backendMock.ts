import { EstimationMode } from '@emeraldpay/api';
import {
  BackendApi,
  BitcoinRawTransaction,
  BlockchainCode,
  EthereumRawReceipt,
  EthereumRawTransaction,
} from '@emeraldwallet/core';

export class BlockchainMock {
  balances: Record<string, Record<string, string>> = {};

  setBalance(address: string, coin: string, balance: string): void {
    if (typeof this.balances[address] == 'undefined') {
      this.balances[address] = {};
    }

    this.balances[address][coin] = balance;
  }
}

export class BackendMock implements BackendApi {
  readonly blockchains: Record<string, BlockchainMock> = {};

  useBlockchains(codes: string[]): void {
    codes.forEach((code) => {
      this.blockchains[code.toLowerCase()] = new BlockchainMock();
    });
  }

  broadcastSignedTx(): Promise<string> {
    return Promise.resolve('');
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

  getBalance(blockchain: BlockchainCode, address: string, tokens: string[]): Promise<Record<string, string>> {
    const state = this.blockchains[blockchain.toLowerCase()];

    if (typeof state == 'undefined') {
      return Promise.resolve({});
    }

    const result: { [key: string]: string } = {};

    tokens.forEach((token) => {
      if (state.balances[address]) {
        const balance = state.balances[address][token];

        if (balance) {
          result[token] = balance;
        } else {
          result[token] = '0';
        }
      } else {
        result[token] = '0';
      }
    });
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
