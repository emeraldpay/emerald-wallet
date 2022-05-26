import { BigAmount, CreateAmount, Unit, Units } from '@emeraldpay/bigamount';
import { Satoshi, Wei, WeiEtc } from '@emeraldpay/bigamount-crypto';
import { WeiAny } from '@emeraldpay/bigamount-crypto/lib/ethereum';
import { LedgerApp } from '@emeraldpay/emerald-vault-core';
import { Bitcoin } from './bitcoin';
import { CoinTicker } from './CoinTicker';
import Ethereum from './ethereum/Ethereum';
import EthereumParams from './ethereum/EthereumParams';
import { HDPath } from './hdpath';
import { IBlockchain } from './IBlockchain';

export enum BlockchainCode {
  ETC = 'etc',
  ETH = 'eth',
  Kovan = 'kovan',
  Goerli = 'goerli',
  Unknown = 'unknown',
  BTC = 'btc',
  TestBTC = 'testbtc',
}

export const Blockchains: { [key: string]: IBlockchain } = {
  [BlockchainCode.ETH]: new Ethereum(
    new EthereumParams(BlockchainCode.ETH, CoinTicker.ETH, 1, HDPath.default().forCoin(BlockchainCode.ETH), 12, true),
    'Ethereum',
    ['DAI', 'USDC', 'USDT', 'WETH'],
  ),
  [BlockchainCode.ETC]: new Ethereum(
    new EthereumParams(BlockchainCode.ETC, CoinTicker.ETC, 61, HDPath.default().forCoin(BlockchainCode.ETC), 250),
    'Ethereum Classic',
    [],
  ),
  [BlockchainCode.Kovan]: new Ethereum(
    new EthereumParams(
      BlockchainCode.Kovan,
      CoinTicker.ETH,
      42,
      HDPath.default().forCoin(BlockchainCode.ETH).forAccount(160720),
      100,
    ),
    'Ethereum Kovan Testnet',
    ['WEENUS', 'WETH'],
  ),
  [BlockchainCode.Goerli]: new Ethereum(
    new EthereumParams(
      BlockchainCode.Goerli,
      CoinTicker.ETH,
      5,
      HDPath.default().forCoin(BlockchainCode.ETH).forAccount(160720),
      100,
      true,
    ),
    'Ethereum Goerli Testnet',
    ['WEENUS', 'WETH'],
  ),
  [BlockchainCode.BTC]: new Bitcoin({
    chainId: 0,
    code: BlockchainCode.BTC,
    coinTicker: CoinTicker.BTC,
    decimals: 8,
    hdPath: HDPath.default().forPurpose(84),
    confirmations: 3,
  }),
  [BlockchainCode.TestBTC]: new Bitcoin({
    chainId: 0,
    code: BlockchainCode.TestBTC,
    coinTicker: CoinTicker.TESTBTC,
    decimals: 8,
    hdPath: HDPath.default().forPurpose(84).forCoin(1),
    confirmations: 10,
  }),
};

const allCodes = [
  BlockchainCode.BTC,
  BlockchainCode.ETC,
  BlockchainCode.ETH,
  BlockchainCode.Kovan,
  BlockchainCode.Goerli,
  BlockchainCode.TestBTC,
];

const allChains = allCodes.map((code) => Blockchains[code]);

export function isValidChain(code: BlockchainCode): boolean {
  return Blockchains[code] != null;
}

export function blockchainCodeByName(name: string): string {
  if (!name) {
    throw new Error('Empty chain name passed');
  }
  const cleanName = name.toLowerCase();
  return allCodes.find((code) => code === cleanName) || BlockchainCode.Unknown;
}

export function blockchainByName(name: string): IBlockchain {
  const code = blockchainCodeByName(name);
  if (!Blockchains[code]) {
    throw new Error(`Unsupported chain: ${code}`);
  }
  return Blockchains[code];
}

export function ethereumByChainId(id?: number): IBlockchain | undefined {
  if (typeof id === 'undefined') {
    return undefined;
  }
  return allChains.find((chain) => chain.params.chainId === id);
}

export function blockchainIdToCode(id: number): BlockchainCode {
  switch (id) {
    case 1:
      return BlockchainCode.BTC;
    case 100:
      return BlockchainCode.ETH;
    case 101:
      return BlockchainCode.ETC;
    case 10002:
      return BlockchainCode.Kovan;
    case 10003:
      return BlockchainCode.TestBTC;
    case 10005:
      return BlockchainCode.Goerli;
    default:
      throw Error('Unsupported blockchain id: ' + id);
  }
}

export function blockchainById(id: number): IBlockchain | undefined {
  return Blockchains[blockchainIdToCode(id)];
}

export function blockchainCodeToId(code: BlockchainCode): number {
  switch (code) {
    case BlockchainCode.BTC:
      return 1;
    case BlockchainCode.ETH:
      return 100;
    case BlockchainCode.ETC:
      return 101;
    case BlockchainCode.Kovan:
      return 10002;
    case BlockchainCode.TestBTC:
      return 10003;
    case BlockchainCode.Goerli:
      return 10005;
    default:
      throw Error('Unsupported blockchain: ' + code);
  }
}

export function isEthereum(code: BlockchainCode): boolean {
  return (
    code === BlockchainCode.ETH ||
    code === BlockchainCode.ETC ||
    code === BlockchainCode.Kovan ||
    code === BlockchainCode.Goerli
  );
}

export function isBitcoin(code: BlockchainCode): boolean {
  return code == BlockchainCode.BTC || code == BlockchainCode.TestBTC;
}

export const WEIS_KOVAN = new Units([
  new Unit(0, 'KovanWei', 'KovWei'),
  new Unit(9, 'KovanGwei', 'KovGWei'),
  new Unit(18, 'KovanEther', 'ETK'),
]);

export const WEIS_GOERLI = new Units([
  new Unit(0, 'GoerliWei', 'GoeWei'),
  new Unit(9, 'GoerliGwei', 'GoeGWei'),
  new Unit(18, 'GoerliEther', 'ETG'),
]);

export const SATOSHIS_TEST = new Units([new Unit(0, 'Test Satoshi', 'tsat'), new Unit(8, 'Test Bitcoin', 'TBTC')]);

export function amountFactory(code: BlockchainCode): CreateAmount<BigAmount> {
  if (isEthereum(code)) {
    if (BlockchainCode.ETH == code) {
      return Wei.factory();
    }
    if (BlockchainCode.ETC == code) {
      return WeiEtc.factory();
    }
    if (BlockchainCode.Kovan == code) {
      return (n) => new WeiAny(n, WEIS_KOVAN);
    }
    if (BlockchainCode.Goerli == code) {
      return (n) => new WeiAny(n, WEIS_GOERLI);
    }
  }
  if (isBitcoin(code)) {
    if (BlockchainCode.BTC == code) {
      return Satoshi.factory();
    }
    if (BlockchainCode.TestBTC == code) {
      return (n) => new BigAmount(n, SATOSHIS_TEST);
    }
  }
  throw new Error('Unsupported blockchain: ' + code);
}

export function amountDecoder<T extends BigAmount>(code: BlockchainCode): (n: string) => T {
  const factory = amountFactory(code) as CreateAmount<T>;

  const { units } = factory(0);

  return (n) => BigAmount.decodeFor(n, units, factory);
}

export const ledgerByBlockchain: Record<LedgerApp, BlockchainCode> = {
  bitcoin: BlockchainCode.BTC,
  'bitcoin-testnet': BlockchainCode.TestBTC,
  ethereum: BlockchainCode.ETH,
  'ethereum-classic': BlockchainCode.ETC,
};
