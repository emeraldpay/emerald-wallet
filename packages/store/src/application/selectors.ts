import { BlockchainCode, TokenData, blockchainCodeToId } from '@emeraldwallet/core';
import { IState } from '../index';
import { ApplicationMessage, DefaultFee, moduleName } from './types';

export function getDefaultFee<T>(state: IState, blockchain: BlockchainCode): DefaultFee<T> | undefined {
  const defaultFee = state[moduleName].options[`default_fee.${blockchainCodeToId(blockchain)}`] as string | undefined;

  if (defaultFee == null) {
    return undefined;
  }

  return JSON.parse(defaultFee);
}

export function getFeeTtl<T = number | undefined>(state: IState, blockchain: BlockchainCode): T {
  return state[moduleName].options[`fee_ttl.${blockchainCodeToId(blockchain)}`] as T;
}

export function getFeeRangeTtl<T = number | undefined>(state: IState, blockchain: BlockchainCode): T {
  return state[moduleName].options[`fee_range_ttl.${blockchainCodeToId(blockchain)}`] as T;
}

export function getLedgerMinVersion<T = string | undefined>(state: IState, blockchain: BlockchainCode): T {
  return state[moduleName].options[`ledger_min_version.${blockchainCodeToId(blockchain)}`] as T;
}

export function getMessage(state: IState): ApplicationMessage {
  return state[moduleName].message;
}

export function getTokens(state: IState): TokenData[] {
  return state[moduleName].tokens;
}

export function isConfigured(state: IState): boolean {
  return state[moduleName].configured;
}

export function isConnecting(state: IState): boolean {
  return state[moduleName].connecting;
}

export function terms(state: IState): string {
  return state[moduleName].terms;
}
