import {
  IAddressesState, AddressesAction, LoadingAction, Actions, SetListAction,
} from "./types";

export const INITIAL_STATE: IAddressesState = {
  addresses: [],
  loading: true,
};

function onLoading(state: IAddressesState, action: LoadingAction): IAddressesState {
  return {
    ...state,
    loading: true,
  };
}

function onSetList(state: IAddressesState, action: SetListAction): IAddressesState {
  console.log(JSON.stringify(action));
  return state;
}

export function reducer(
  state: IAddressesState = INITIAL_STATE,
  action: AddressesAction
): IAddressesState {
  switch(action.type) {
    case Actions.LOADING:
      return onLoading(state, action);
    case Actions.SET_LIST:
      return onSetList(state, action);
    default:
      return state;
  }
}
