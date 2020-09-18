import { IBlockchain } from './IBlockchain';
import { CoinTicker } from './CoinTicker';
import Ethereum from './ethereum/Ethereum';
import EthereumParams from './ethereum/EthereumParams';
import {HDPath} from "./hdpath";
import {Bitcoin} from "./bitcoin";

export enum BlockchainCode {
  ETC = 'etc',
  ETH = 'eth',
  Kovan = 'kovan',
  Unknown = 'unknown',
  BTC = 'btc',
  TestBTC = 'testbtc'
}

export const Blockchains: {[key: string]: IBlockchain} = {
  [BlockchainCode.ETH]: new Ethereum(
    new EthereumParams(BlockchainCode.ETH, CoinTicker.ETH, 1,
      HDPath.default().forCoin(BlockchainCode.ETH)),
    'Ethereum',
    ['DAI', 'USDT']
  ),
  [BlockchainCode.ETC]: new Ethereum(
    new EthereumParams(BlockchainCode.ETC, CoinTicker.ETC, 61,
      HDPath.default().forCoin(BlockchainCode.ETC)),
    'Ethereum Classic',
    []
  ),
  [BlockchainCode.Kovan]: new Ethereum(
    new EthereumParams(BlockchainCode.Kovan, CoinTicker.KOVAN, 42,
      HDPath.default().forCoin(BlockchainCode.ETH).forAccount(160720)),
    'Ethereum Kovan Testnet',
    ['WEENUS']
  ),
  [BlockchainCode.BTC]: new Bitcoin({
    chainId: 0,
    code: BlockchainCode.BTC,
    coinTicker: CoinTicker.BTC,
    decimals: 8,
    hdPath: HDPath.default().forPurpose(84)
  }),
  [BlockchainCode.TestBTC]: new Bitcoin({
    chainId: 0,
    code: BlockchainCode.TestBTC,
    coinTicker: CoinTicker.TESTBTC,
    decimals: 8,
    hdPath: HDPath.default().forPurpose(84)
  })
};

const allCodes = [BlockchainCode.BTC, BlockchainCode.ETC, BlockchainCode.ETH, BlockchainCode.Kovan, BlockchainCode.TestBTC];
const allChains = allCodes.map((code) => Blockchains[code]);

export function isValidChain (code: BlockchainCode): boolean {
  return Blockchains[code] ? true : false;
}

export function blockchainCodeByName (name: string): string {
  if (!name) {
    throw new Error('Empty chain name passed');
  }
  const cleanName = name.toLowerCase();
  return allCodes.find((code) => code === cleanName) || BlockchainCode.Unknown;
}

export function blockchainByName (name: string): IBlockchain {
  const code = blockchainCodeByName(name);
  if (!Blockchains[code]) {
    throw new Error(`Unsupported chain: ${code}`);
  }
  return Blockchains[code];
}

export function ethereumByChainId (id?: number): IBlockchain | undefined {
  if (typeof id === 'undefined') {
    return undefined;
  }
  return allChains.find((chain) => chain.params.chainId === id);
}

export function blockchainById (id: number): IBlockchain | undefined {
  return Blockchains[blockchainIdToCode(id)];
}

export function blockchainCodeToId (code: BlockchainCode): number {
  if (code === BlockchainCode.BTC) {
    return 1;
  }
  if (code === BlockchainCode.ETH) {
    return 100;
  }
  if (code === BlockchainCode.ETC) {
    return 101;
  }
  if (code === BlockchainCode.Kovan) {
    return 10002;
  }
  if (code === BlockchainCode.TestBTC) {
    return 10003;
  }
  throw Error('Unsupported blockchain: ' + code);
}

export function blockchainIdToCode(id: number): BlockchainCode {
  if (id === 1) {
    return BlockchainCode.BTC;
  }
  if (id === 100) {
    return BlockchainCode.ETH;
  }
  if (id === 101) {
    return BlockchainCode.ETC;
  }
  if (id === 10002) {
    return BlockchainCode.Kovan;
  }
  if (id === 10003) {
    return BlockchainCode.TestBTC;
  }
  throw Error('Unsupported blockchain id: ' + id);
}

export function isEthereum(code: BlockchainCode): boolean {
  return code == BlockchainCode.ETH || code == BlockchainCode.Kovan || code == BlockchainCode.ETC
}

export function isBitcoin(code: BlockchainCode): boolean {
  return code == BlockchainCode.BTC || code == BlockchainCode.TestBTC
}