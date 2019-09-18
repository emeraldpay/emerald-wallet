import {ITokensState, TokensAction} from "./types";

export const INITIAL_STATE: ITokensState = {};


export function reducer(
  state: ITokensState = INITIAL_STATE,
  action: TokensAction
): ITokensState {

  return state;
}
