import { BigAmount, CreateAmount, Unit, Units } from '@emeraldpay/bigamount';
import { Satoshi, SatoshiAny, Wei, WeiAny, WeiEtc } from '@emeraldpay/bigamount-crypto';
import { LedgerApp } from '@emeraldpay/emerald-vault-core';
import { Bitcoin } from './Bitcoin';
import { Coin } from './coin';
import { CoinTicker } from './coinTicker';
import { Ethereum, EthereumParams } from './ethereum';
import { HDPath } from './HDPath';
import { IBlockchain } from './IBlockchain';

export enum BlockchainCode {
  // Mainnet
  BTC = 'btc',
  ETC = 'etc',
  ETH = 'eth',
  // Testnet
  Sepolia = 'sepolia',
  TestBTC = 'testbtc',
  // Other
  Unknown = 'unknown',
}

export const Blockchains: Record<BlockchainCode | string, IBlockchain> = {
  [BlockchainCode.ETH]: new Ethereum(
    new EthereumParams(
      BlockchainCode.ETH,
      Coin.ETHER,
      CoinTicker.ETH,
      1,
      HDPath.default().forCoin(BlockchainCode.ETH),
      12,
      true,
    ),
    'Ethereum',
  ),
  [BlockchainCode.ETC]: new Ethereum(
    new EthereumParams(
      BlockchainCode.ETC,
      Coin.ETHER,
      CoinTicker.ETC,
      61,
      HDPath.default().forCoin(BlockchainCode.ETC),
      250,
    ),
    'Ethereum Classic',
  ),
  [BlockchainCode.Sepolia]: new Ethereum(
    new EthereumParams(
      BlockchainCode.Sepolia,
      Coin.ETHER,
      CoinTicker.SEPOLIA,
      11155111,
      HDPath.default().forCoin(BlockchainCode.ETH).forAccount(160720),
      100,
      true,
    ),
    'Sepolia Testnet',
  ),
  [BlockchainCode.BTC]: new Bitcoin({
    chainId: 0,
    code: BlockchainCode.BTC,
    coin: Coin.BTC,
    coinTicker: CoinTicker.BTC,
    decimals: 8,
    hdPath: HDPath.default().forPurpose(84),
    confirmations: 3,
  }),
  [BlockchainCode.TestBTC]: new Bitcoin({
    chainId: 0,
    code: BlockchainCode.TestBTC,
    coin: Coin.BTC,
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
  BlockchainCode.Sepolia,
  BlockchainCode.TestBTC,
];

const allChains = allCodes.map((code) => Blockchains[code]);

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

export function isBlockchainId(id: number): boolean {
  return id == 1 || id == 100 || id == 101 || id == 10003 || id == 10009;
}

export function blockchainIdToCode(id: number): BlockchainCode {
  switch (id) {
    case 1:
      return BlockchainCode.BTC;
    case 100:
      return BlockchainCode.ETH;
    case 101:
      return BlockchainCode.ETC;
    case 10003:
      return BlockchainCode.TestBTC;
    case 10009:
      return BlockchainCode.Sepolia;
    default:
      throw new Error(`Unsupported blockchain id: ${id}`);
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
    case BlockchainCode.TestBTC:
      return 10003;
    case BlockchainCode.Sepolia:
      return 10009;
    default:
      throw new Error(`Unsupported blockchain: ${code}`);
  }
}

export function isEthereum(code: BlockchainCode): boolean {
  return code === BlockchainCode.ETH || code === BlockchainCode.ETC || code === BlockchainCode.Sepolia;
}

export function isBitcoin(code: BlockchainCode): boolean {
  return code == BlockchainCode.BTC || code == BlockchainCode.TestBTC;
}

export const WEIS_SEPOLIA = new Units([
  new Unit(0, 'Sepolia Wei', 'WeiS'),
  new Unit(3, 'Sepolia Kwei', 'KWeiS'),
  new Unit(6, 'Sepolia Mwei', 'MWeiS'),
  new Unit(9, 'Sepolia Gwei', 'GWeiS'),
  new Unit(12, 'Sepolia Microether', 'μETS'),
  new Unit(15, 'Sepolia Milliether', 'mETS'),
  new Unit(18, 'Sepolia Ether', 'ETS'),
]);

export const SATOSHIS_TEST = new Units([
  new Unit(0, 'Test Satoshi', 'tsat'),
  new Unit(1, 'Test Finney', 'tfin'),
  new Unit(2, 'Test bit', 'tμBTC'),
  new Unit(5, 'Test millibit', 'tmBTC'),
  new Unit(8, 'Test Bitcoin', 'TestBTC'),
]);

export function amountFactory(code: BlockchainCode): CreateAmount<BigAmount> {
  switch (code) {
    case BlockchainCode.BTC:
      return Satoshi.factory();
    case BlockchainCode.ETC:
      return WeiEtc.factory();
    case BlockchainCode.ETH:
      return Wei.factory();
    case BlockchainCode.Sepolia:
      return (value) => new WeiAny(value, WEIS_SEPOLIA);
    case BlockchainCode.TestBTC:
      return (value) => new SatoshiAny(value, SATOSHIS_TEST);
    default:
      throw new Error(`Unsupported blockchain: ${code}`);
  }
}

export function amountDecoder<T extends BigAmount>(code: BlockchainCode): (value: string) => T {
  const factory = amountFactory(code) as CreateAmount<T>;

  const { units } = factory(0);

  return (value) => BigAmount.decodeFor(value, units, factory);
}

export const ledgerByBlockchain: Record<LedgerApp, BlockchainCode> = {
  bitcoin: BlockchainCode.BTC,
  'bitcoin-testnet': BlockchainCode.TestBTC,
  ethereum: BlockchainCode.ETH,
  'ethereum-classic': BlockchainCode.ETC,
};
