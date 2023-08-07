import { TokenRegistry } from '@emeraldwallet/core';
import produce from 'immer';
import {
  ActionTypes,
  Allowance,
  AllowanceAction,
  AllowanceState,
  AllowanceType,
  SetAddressAllowanceAction,
} from './types';

const INITIAL_STATE: AllowanceState = {};

function setAddressAllowance(
  state: AllowanceState,
  {
    payload: {
      allowance: { address, blockchain, allowance, available, contractAddress, ownerAddress, spenderAddress },
      tokens,
    },
  }: SetAddressAllowanceAction,
): AllowanceState {
  const tokenRegistry = new TokenRegistry(tokens);

  if (tokenRegistry.hasAddress(blockchain, contractAddress)) {
    const token = tokenRegistry.byAddress(blockchain, contractAddress);

    const allowanceAddress = address.toLowerCase();
    const allowanceContractAddress = contractAddress.toLowerCase();

    const type =
      allowanceAddress === ownerAddress.toLowerCase() ? AllowanceType.ALLOWED_FOR : AllowanceType.APPROVED_BY;

    const oldAllowances = state[blockchain]?.[allowanceAddress]?.[type]?.[allowanceContractAddress] ?? [];
    const allowances = [...oldAllowances];

    const newAllowance: Allowance = {
      blockchain,
      ownerAddress,
      spenderAddress,
      token,
      type,
      allowance: token.getAmount(allowance),
      available: token.getAmount(available),
    };

    if (allowances.length > 0) {
      const index = allowances.findIndex((item) => item.spenderAddress.toLowerCase() === spenderAddress.toLowerCase());

      if (index > -1) {
        allowances[index] = newAllowance;
      } else {
        allowances.push(newAllowance);
      }
    } else {
      allowances.push(newAllowance);
    }

    return produce(state, (draft) => {
      draft[blockchain] = {
        ...draft[blockchain],
        [allowanceAddress]: {
          ...draft[blockchain]?.[allowanceAddress],
          [type]: {
            ...draft[blockchain]?.[allowanceAddress]?.[type],
            [allowanceContractAddress]: allowances,
          },
        },
      };
    });
  }

  return state;
}

export function reducer(state = INITIAL_STATE, action: AllowanceAction): AllowanceState {
  switch (action.type) {
    case ActionTypes.SET_ADDRESS_ALLOWANCE:
      return setAddressAllowance(state, action);
    default:
      return state;
  }
}
