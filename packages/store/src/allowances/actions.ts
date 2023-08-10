import { Dispatched } from '../types';
import { ActionTypes, AllowanceRaw, InitAllowanceAction } from './types';

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
