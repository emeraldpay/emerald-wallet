import { BlockchainCode, IApi } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import { Dispatch } from 'react';
import {IAddressesState} from "./accounts/types";
import {IAddressBookState} from "./address-book/types";
import {IBlockchainsState} from "./blockchains/types";
import {IScreenState} from "./screen/types";
import {ISettingsState} from "./settings/types";
import {ITokensState} from "./tokens/types";
import {ITransactionState} from "./transaction/types";

export type State = {
  addresses: IAddressesState,
  "address-book": IAddressBookState,
  blockchains: IBlockchainsState,
  conn: any,
  launcher: any,
  ledger: any,
  screen: IScreenState,
  wallet: {
    settings: ISettingsState,
    history: any,
  }
  tokens: ITokensState,
  transactions: ITransactionState,
}
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
