export interface IBlockchain {
  height: number | null;
}

export interface IBlockchainsState extends Map<string, IBlockchain> {

}

export enum Actions {
  BLOCK = 'BLOCKCHAINS/BLOCK',
}

export interface BlockAction {
  type: Actions.BLOCK;
  payload: any;
}

export type BlockchainsAction = BlockAction;
