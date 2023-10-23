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

export type SignHandler = (txId: string | null, raw: string | null) => void;

/**
 * FIXME Use action from new create transaction flow
 * @deprecated
 */
export type GasPriceType = number | string;
/**
 * FIXME Use action from new create transaction flow
 * @deprecated
 */
export type GasPrices<T = GasPriceType> = Record<'max' | 'priority', T>;
/**
 * FIXME Use action from new create transaction flow
 * @deprecated
 */
export type PriceSort = Record<'highs' | 'priorities', BigNumber[]>;

/**
 * FIXME Use action from new create transaction flow
 * @deprecated
 */
export const DEFAULT_FEE: GasPrices = { max: 0, priority: 0 } as const;
/**
 * FIXME Use action from new create transaction flow
 * @deprecated
 */
export const FEE_KEYS = ['avgLast', 'avgTail5', 'avgMiddle'] as const;

/**
 * FIXME Use action from new create transaction flow
 * @deprecated
 */
export type FeePrices<T = GasPriceType> = Record<(typeof FEE_KEYS)[number], T>;
