import { BigAmount } from '@emeraldpay/bigamount';
import { UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, EthereumTransaction } from '@emeraldwallet/core';

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
  tokenAmount?: BigAmount;
}
