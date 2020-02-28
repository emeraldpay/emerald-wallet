import { Wei } from '@emeraldplatform/eth';

export const moduleName = 'blockchains';

export interface IBlockchain {
  height: number | null;
  gasPrice: Wei | null;
}

export type IBlockchainsState = Map<string, IBlockchain>;

export enum ActionTypes {
  BLOCK = 'BLOCKCHAINS/BLOCK',
  GAS_PRICE = 'BLOCKCHAINS/GAS_PRICE',
  FETCH_GAS_PRICE = 'BLOCKCHAINS/GET_GAS_PRICE'
}

export interface BlockAction {
  type: ActionTypes.BLOCK;
  payload: any;
}

export interface GasPriceAction {
  type: ActionTypes.GAS_PRICE;
  payload: {
    blockchain: string,
    gasPrice: Wei
  };
}

export interface FetchGasPriceAction {
  type: ActionTypes.FETCH_GAS_PRICE;
  payload: any;
}

export type BlockchainsAction = BlockAction | GasPriceAction | FetchGasPriceAction;
