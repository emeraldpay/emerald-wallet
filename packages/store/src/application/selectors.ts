import { BlockchainCode, blockchainCodeToId } from '@emeraldwallet/core';
import { ApplicationMessage, moduleName } from './types';
import { DefaultFee, GasPriceType, IState } from '../types';

export function getDefaultFee<T = GasPriceType>(state: IState, blockchain: BlockchainCode): DefaultFee<T> {
  return JSON.parse(state[moduleName].options[`default_fee.${blockchainCodeToId(blockchain)}`] as string);
}

export function getFeeTtl(state: IState, blockchain: BlockchainCode): number {
  return state[moduleName].options[`fee_ttl.${blockchainCodeToId(blockchain)}`] as number;
}

export function getMessage(state: IState): ApplicationMessage {
  return state[moduleName].message;
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
