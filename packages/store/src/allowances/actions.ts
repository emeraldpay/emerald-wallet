import { Dispatched } from '../types';
import {ActionTypes, AllowanceCommon, AllowanceRaw, InitAllowanceAction, SetAllowanceAction} from './types';
import {TokenData} from "@emeraldwallet/core";

export function initAddressAllowance(allowance: AllowanceRaw): Dispatched<void, InitAllowanceAction> {
  return (dispatch, getState, extra) => {
    const {
      application: { tokens },
    } = getState();

    Promise.all([
      extra.backendApi.describeAddress(allowance.blockchain, allowance.ownerAddress),
      extra.backendApi.describeAddress(allowance.blockchain, allowance.spenderAddress),
    ]).then(([{ control: ownerControl }, { control: spenderControl }]) =>
      dispatch({
        type: ActionTypes.INIT_ALLOWANCE,
        payload: { allowance: { ...allowance, ownerControl, spenderControl }, tokens },
      }),
    );
  };
}

export function setAllowance(allowance: AllowanceCommon, tokens: TokenData[]): SetAllowanceAction {
  return {
    type: ActionTypes.SET_ALLOWANCE,
    payload: { allowance, tokens },
  };
}
