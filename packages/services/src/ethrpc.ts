import { PartialEthereumTransaction, toBigNumber, toHex, toNumber } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { JsonRpc } from './jsonrpc';
import { EthersJsonRpc } from './jsonrpc/JsonRpc';

interface PartialBlock<P, E = P> {
  difficulty: E;
  gasLimit: P;
  gasUsed: P;
  number: P;
  size: P;
  timestamp: P;
  totalDifficulty: E;
  [key: string]: any;
}

function formatBlock(block: PartialBlock<string>): PartialBlock<number, BigNumber> {
  return {
    ...block,
    difficulty: toBigNumber(block.difficulty),
    gasLimit: toNumber(block.gasLimit),
    gasUsed: toNumber(block.gasUsed),
    number: toNumber(block.number),
    size: toNumber(block.size),
    timestamp: toNumber(block.timestamp),
    totalDifficulty: toBigNumber(block.totalDifficulty),
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
   * Executes a new message call immediately without creating a transaction on the blockchain
   */
  call({ data, to }: PartialEthereumTransaction, blockNumber: number | string = 'latest'): Promise<any> {
    return this.rpc.call('eth_call', [{ data, to }, blockNumber]);
  }

  /**
   * Executes a message call or transaction and returns the amount of the gas used
   */
  estimateGas(tx: PartialEthereumTransaction<string>): Promise<number> {
    return this.rpc.call('eth_estimateGas', [tx]).then(toNumber);
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
    return this.rpc.call('eth_blockNumber', []).then(toNumber);
  }

  /**
   * Returns information about a block by block number.
   */
  getBlockByNumber(blockNumber: number | string = 'latest', full = false): Promise<any> {
    return this.rpc.call('eth_getBlockByNumber', [
      typeof blockNumber === 'string' ? blockNumber : `0x${blockNumber.toString(16)}`,
      full,
    ]);
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

    return this.rpc.call(method, [block, full]).then(formatBlock);
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

  getTransactionReceipt(hash: string): Promise<any> {
    return this.rpc.call('eth_getTransactionReceipt', [hash]);
  }

  /**
   * Returns the information about a transaction requested by transaction hash.
   */
  getTransaction(hash: string): Promise<any> {
    return this.rpc.call('eth_getTransactionByHash', [hash]);
  }
}

export default class EthRpc {
  eth: EthApi;
  ethers: EthersJsonRpc;
  rpc: JsonRpc;

  constructor(jsonRpc: JsonRpc, ethers: EthersJsonRpc) {
    this.eth = new EthApi(jsonRpc);
    this.ethers = ethers;
    this.rpc = jsonRpc;
  }

  raw(method: string, params: any): Promise<any> {
    return this.rpc.call(method, params);
  }
}
