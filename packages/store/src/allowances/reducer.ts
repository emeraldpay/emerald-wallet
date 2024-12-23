import { TokenRegistry } from '@emeraldwallet/core';
import produce from 'immer';
import {
  ActionTypes,
  Allowance,
  AllowanceAction, AllowanceCommon,
  AllowanceState,
  AllowanceType,
  InitAllowanceAction,
  RemoveAllowanceAction,
  SetAllowanceAction,
} from './types';

const INITIAL_STATE: AllowanceState = {};

function setAllowance(
  state: AllowanceState,
  value: SetAllowanceAction,
): AllowanceState {

  const tokenRegistry = new TokenRegistry(value.tokens);
  let updatedState = Object.assign({}, state);

  for (const next of value.allowances) {
    const {
      address,
      blockchain,
      allowance,
      available,
      contractAddress,
      ownerAddress,
      ownerControl,
      spenderAddress,
      spenderControl,
      timestamp,
    } = next;

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
        timestamp,
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

      updatedState = produce(updatedState, (draft) => {
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
  }

  return updatedState;
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
    return setAllowance(state, { allowances: [payload.allowance], tokens: payload.tokens, type: ActionTypes.SET_ALLOWANCE });
  }

  return state;
}

function removeAllowance(
  state: AllowanceState,
  { payload: { address, blockchain, timestamp: removeTimestamp } }: RemoveAllowanceAction,
): AllowanceState {
  const allowancesByAddress = state[blockchain]?.[address];

  if (allowancesByAddress == null) {
    return state;
  }

  const allowancesByType = Object.keys(allowancesByAddress).reduce((typeCarry, type) => {
    const allowancesByContract = allowancesByAddress[type as AllowanceType];

    return {
      ...typeCarry,
      [type]: Object.keys(allowancesByContract).reduce(
        (contractCarry, contractAddress) => ({
          ...contractCarry,
          [contractAddress]: allowancesByContract[contractAddress].filter(
            ({ timestamp }) => timestamp < removeTimestamp,
          ),
        }),
        {},
      ),
    };
  }, {});

  return produce(state, (draft) => {
    draft[blockchain] = {
      ...draft[blockchain],
      [address]: {
        ...draft[blockchain]?.[address],
        ...allowancesByType,
      },
    };
  });
}

export function reducer(state = INITIAL_STATE, action: AllowanceAction): AllowanceState {
  switch (action.type) {
    case ActionTypes.INIT_ALLOWANCE:
      return initAllowance(state, action);
    case ActionTypes.REMOVE_ALLOWANCE:
      return removeAllowance(state, action);
    case ActionTypes.SET_ALLOWANCE:
      return setAllowance(state, action);
    default:
      return state;
  }
}
