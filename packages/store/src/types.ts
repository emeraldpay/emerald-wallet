import { BlockchainCode, IApi } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { Dispatch } from 'react';

export interface State {[key: string]: any;}
export type GetState = () => State;
export type Dispatched<T> = (dispatch: Dispatch<T | Dispatched<T>>, getState: GetState, api: IApi) => void;

export interface ITransaction {
  hash?: string;

  from: string;
  // Can also be null or void
  to?: string;
  value: string | BigNumber;
  nonce: string | number;
  gas: string | number;
  gasPrice: string | BigNumber;
  // Can either be void or omitted altogether. Cannot be null
  data?: string;
  // @deprecated
  input?: string;

  replayProtected?: boolean;
  blockchain: BlockchainCode;
  chainId?: number;

  timestamp?: Date;
  blockHash?: string;
  blockNumber?: string | number;
  since?: string | Date;
  discarded?: boolean;
  broadcasted?: boolean;
}
