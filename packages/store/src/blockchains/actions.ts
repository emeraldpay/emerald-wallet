import { BlockchainCode } from '@emeraldwallet/core';
import { ActionTypes, Block, BlockAction } from './types';
import { Dispatched } from '../types';

export function blockAction(block: Block): BlockAction {
  return {
    type: ActionTypes.BLOCK,
    payload: block,
  };
}

export function lookupAddress(blockchain: BlockchainCode, address: string): Dispatched<string | null> {
  return (dispatch, getState, extra) => extra.backendApi.lookupAddress(blockchain, address);
}

export function resolveName(blockchain: BlockchainCode, name: string): Dispatched<string | null> {
  return (dispatch, getState, extra) => extra.backendApi.resolveName(blockchain, name);
}
