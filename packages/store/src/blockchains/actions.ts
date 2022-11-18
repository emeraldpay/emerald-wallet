import { BlockchainCode } from '@emeraldwallet/core';
import { ActionTypes, Block, BlockAction } from './types';
import { Dispatched } from '../types';

export function blockAction(block: Block): BlockAction {
  return {
    type: ActionTypes.BLOCK,
    payload: block,
  };
}

export function resolveName(blockchain: BlockchainCode, address: string): Dispatched<string | null> {
  return (dispatch, getState, extra) => extra.backendApi.resolveName(blockchain, address);
}
