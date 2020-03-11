import { Blockchain } from './Blockchain';
import { CoinTicker } from './CoinTicker';
import Ethereum from './ethereum/Ethereum';
import EthereumParams from './ethereum/EthereumParams';

export enum BlockchainCode {
  ETC = 'etc',
  ETH = 'eth',
  Kovan = 'kovan',
  Unknown = 'unknown'
}

export const Blockchains: {[key: string]: Blockchain} = {
  [BlockchainCode.ETH]: new Ethereum(
    new EthereumParams(BlockchainCode.ETH, CoinTicker.ETH, 1,"m/44'/60'/0'/0"),
    'Ethereum',
    ['DAI', 'USDT']
  ),
  [BlockchainCode.ETC]: new Ethereum(
    new EthereumParams(BlockchainCode.ETC, CoinTicker.ETC, 61, "m/44'/61'/0'/0"),
    'Ethereum Classic',
    ['BEC']
  ),
  [BlockchainCode.Kovan]: new Ethereum(
    new EthereumParams(BlockchainCode.Kovan, CoinTicker.KOVAN, 42, "m/44'/60'/160720'/0'"),
    'Ethereum Kovan Testnet',
    ['WEENUS']
  )
};

const allCodes = [BlockchainCode.ETC, BlockchainCode.ETH, BlockchainCode.Kovan];
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

export function blockchainByName (name: string): Blockchain {
  const code = blockchainCodeByName(name);
  if (!Blockchains[code]) {
    throw new Error(`Unsupported chain: ${code}`);
  }
  return Blockchains[code];
}

export function ethereumByChainId (id?: number): Blockchain | undefined {
  if (typeof id === 'undefined') {
    return undefined;
  }
  return allChains.find((chain) => chain.params.chainId === id);
}

export function blockchainById (id: number): Blockchain | undefined {
  if (id == 100) {
    return Blockchains[BlockchainCode.ETH];
  }
  if (id == 101) {
    return Blockchains[BlockchainCode.ETC];
  }
  if (id == 10002) {
    return Blockchains[BlockchainCode.Kovan];
  }
  return undefined;
}

export function blockchainCodeToId (code: BlockchainCode): number {
  if (code == BlockchainCode.ETH) {
    return 100;
  }
  if (code == BlockchainCode.ETC) {
    return 101;
  }
  if (code == BlockchainCode.Kovan) {
    return 10002;
  }
  throw Error('Unsupported blockchain: ' + code);
}
