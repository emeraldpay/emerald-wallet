export const moduleName = 'blockchains';

export interface Blockchain {
  height: number | null;
}

export interface BlockchainsState {
  [code: string]: Blockchain;
}

export enum ActionTypes {
  BLOCK = 'BLOCKCHAINS/BLOCK',
}

export interface Block {
  blockchain: string;
  hash?: string;
  height: number;
}

export interface BlockAction {
  type: ActionTypes.BLOCK;
  payload: Block;
}

export type BlockchainsAction = BlockAction;
