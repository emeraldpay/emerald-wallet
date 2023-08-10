import { TokenRegistry } from '@emeraldwallet/core';
import produce from 'immer';
import {
  ActionTypes,
  Allowance,
  AllowanceAction,
  AllowanceState,
  AllowanceType,
  InitAllowanceAction,
  SetAllowanceAction,
} from './types';

const INITIAL_STATE: AllowanceState = {};

function setAllowance(
  state: AllowanceState,
  {
    payload: {
      allowance: {
        address,
        blockchain,
        allowance,
        available,
        contractAddress,
        ownerAddress,
        ownerControl,
        spenderAddress,
        spenderControl,
      },
      tokens,
    },
  }: SetAllowanceAction,
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
      ownerControl,
      spenderAddress,
      spenderControl,
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

function initAllowance(state: AllowanceState, { payload }: InitAllowanceAction): AllowanceState {
  const {
    allowance: { address, blockchain, contractAddress, ownerAddress, spenderAddress },
  } = payload;

  const allowanceAddress = address.toLowerCase();
  const allowanceContractAddress = contractAddress.toLowerCase();

  const type = allowanceAddress === ownerAddress.toLowerCase() ? AllowanceType.ALLOWED_FOR : AllowanceType.APPROVED_BY;

  const allowance = state[blockchain]?.[allowanceAddress]?.[type]?.[allowanceContractAddress].find(
    (item) => item.spenderAddress === spenderAddress,
  );

  if (allowance == null) {
    return setAllowance(state, { payload, type: ActionTypes.SET_ALLOWANCE });
  }

  return state;
}

export function reducer(state = INITIAL_STATE, action: AllowanceAction): AllowanceState {
  switch (action.type) {
    case ActionTypes.INIT_ALLOWANCE:
      return initAllowance(state, action);
    case ActionTypes.SET_ALLOWANCE:
      return setAllowance(state, action);
    default:
      return state;
  }
}
