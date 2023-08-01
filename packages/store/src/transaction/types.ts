import { BigAmount } from '@emeraldpay/bigamount';
import { UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, EthereumTransaction, TokenAmount } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';

export interface SignData {
  blockchain: BlockchainCode;
  entryId: string;
  signed: string;
  tx: EthereumTransaction | UnsignedBitcoinTx;
  txId: string;
}

export interface BroadcastData extends SignData {
  fee: BigAmount;
  originalAmount?: BigAmount;
  tokenAmount?: TokenAmount;
}

export type GasPriceType = number | string;
export type GasPrices<T = GasPriceType> = Record<'max' | 'priority', T>;
export type PriceSort = Record<'highs' | 'priorities', BigNumber[]>;

export const DEFAULT_FEE: GasPrices = { max: 0, priority: 0 } as const;
export const FEE_KEYS = ['avgLast', 'avgTail5', 'avgMiddle'] as const;

export type FeePrices<T = GasPriceType> = Record<(typeof FEE_KEYS)[number], T>;

export type SignHandler = (txId: string | null, raw: string | null) => void;
