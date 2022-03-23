export const moduleName = 'blockchains';

export interface IBlockchain {
  height: number | null;
}

export interface IBlockchainsState {
  [code: string]: IBlockchain;
}
export enum ActionTypes {
  BLOCK = 'BLOCKCHAINS/BLOCK',
}

export interface IBlockAction {
  type: ActionTypes.BLOCK;
  payload: any;
}

export type BlockchainsAction = IBlockAction;
