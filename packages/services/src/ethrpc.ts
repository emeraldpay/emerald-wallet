import { toBigNumber, toHex, toNumber } from '@emeraldwallet/core';
import { JsonRpc } from './jsonrpc';

export type CallObject = {
  to: string;
  data?: string;
  nonce?: number;
  gas?: number;
};

function formatBlock(b: any): any {
  return {
    ...b,
    difficulty: toBigNumber(b.difficulty),
    totalDifficulty: toBigNumber(b.totalDifficulty),
    gasLimit: toNumber(b.gasLimit),
    gasUsed: toNumber(b.gasUsed),
    size: toNumber(b.size),
    timestamp: toNumber(b.timestamp),
    number: toNumber(b.number),
  };
}

function isPredefinedBlockNumber(blockNumber: number | string): boolean {
  return blockNumber === 'latest' || blockNumber === 'pending' || blockNumber === 'earliest';
}

export class EthApi {
  rpc: JsonRpc;
  compile: object;

  constructor(jsonRpc: JsonRpc) {
    this.rpc = jsonRpc;
    this.compile = {
      solidity: this.compileSolidity.bind(this),
    };
  }

  /**
   * Gets a list of available compilers
   */
  getCompilers(): Promise<string[]> {
    return this.rpc.call('eth_getCompilers', []);
  }

  /**
   * Returns compiled solidity code
   */
  compileSolidity(code: string): Promise<object> {
    return this.rpc.call('eth_compileSolidity', [code]);
  }

  /**
   * Executes a new message call immediately without creating a transaction on the block chain
   */
  call(callData: CallObject, blockNumber: number | string = 'latest'): Promise<any> {
    return this.rpc.call('eth_call', [{ to: callData.to, data: callData.data }, blockNumber]);
  }

  /**
   * Executes a message call or transaction and returns the amount of the gas used
   */
  estimateGas(call: CallObject): Promise<number> {
    const txData = {
      ...call,
      gas: call.gas !== undefined ? toHex(call.gas) : call.gas,
      nonce: call.nonce !== undefined ? toHex(call.nonce) : call.nonce,
    };
    return this.rpc.call('eth_estimateGas', [txData]).then((gas: any) => toNumber(gas));
  }

  /**
   * Returns code at a given address.
   */
  getCode(address: string, blockNumber: number | string = 'latest'): Promise<string> {
    return this.rpc.call('eth_getCode', [address, blockNumber]);
  }

  /**
   * Returns the number of most recent block
   *
   * Note: It should be called blockNumber() but to be web3 compatible
   *       we call it getBlockNumber(), FEF
   */
  getBlockNumber(): Promise<number> {
    return this.rpc.call('eth_blockNumber', []).then((result: any) => toNumber(result));
  }

  /**
   * Returns information about a block by block number.
   */
  getBlockByNumber(blockNumber: number | string = 'latest', full = false): Promise<any> {
    return this.rpc.call('eth_getBlockByNumber', [blockNumber, full]);
  }

  /**
   * Returns a block matching the block number or block hash.
   */
  getBlock(hashOrNumber: string | number | 'earliest' | 'latest' | 'pending', full = false): Promise<any> {
    const method =
      typeof hashOrNumber === 'string' && hashOrNumber.indexOf('0x') === 0
        ? 'eth_getBlockByHash'
        : 'eth_getBlockByNumber';
    let block = hashOrNumber;
    if (method === 'eth_getBlockByNumber') {
      if (!isPredefinedBlockNumber(hashOrNumber)) {
        block = toHex(hashOrNumber);
      }
    }
    return this.rpc.call(method, [block, full]).then((b: any) => formatBlock(b));
  }

  /**
   * Returns the number of transactions sent from an address
   * @param address
   * @param blockNumber - integer block number, or the string 'latest', 'earliest' or 'pending'
   */
  getTransactionCount(address: string, blockNumber: number | string = 'latest'): Promise<any> {
    return this.rpc.call('eth_getTransactionCount', [address, blockNumber]).then(toNumber);
  }

  /**
   * Creates new message call transaction or a contract creation for signed transactions.
   */
  sendRawTransaction(rawTxData: string): Promise<string> {
    return this.rpc.call('eth_sendRawTransaction', [rawTxData]);
  }

  /**
   * Returns the information about a transaction requested by transaction hash.
   */
  getTransaction(hash: string): Promise<any> {
    return this.rpc.call('eth_getTransactionByHash', [hash]);
  }
}

export default class EthRpc {
  rpc: JsonRpc;
  eth: EthApi;

  constructor(jsonRpc: JsonRpc) {
    this.rpc = jsonRpc;
    this.eth = new EthApi(jsonRpc);
  }

  raw(method: string, params: any): Promise<any> {
    return this.rpc.call(method, params);
  }
}
