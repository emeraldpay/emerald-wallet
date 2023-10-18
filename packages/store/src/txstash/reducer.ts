import {
  ActionTypes,
  CreateTxStage,
  SetAssetAction,
  SetEntryAction,
  SetFeeLoadingAction,
  SetFeeRangeAction,
  SetSignedAction,
  SetStageAction,
  SetTransactionAction,
  TxStashAction,
  TxStashState,
} from './types';

const INITIAL_STATE: TxStashState = { stage: CreateTxStage.SETUP };

function reset({ fee }: TxStashState): TxStashState {
  return { ...INITIAL_STATE, fee };
}

function setAsset(state: TxStashState, { payload: { asset } }: SetAssetAction): TxStashState {
  return { ...state, asset };
}

function setEntry(state: TxStashState, { payload: { entry, ownerAddress } }: SetEntryAction): TxStashState {
  return { ...state, entry, ownerAddress };
}

function setFeeLoading(state: TxStashState, { payload: { blockchain } }: SetFeeLoadingAction): TxStashState {
  return {
    ...state,
    fee: {
      ...state.fee,
      [blockchain]: undefined,
    },
  };
}

function setFeeRange(state: TxStashState, { payload: { blockchain, range } }: SetFeeRangeAction): TxStashState {
  return {
    ...state,
    fee: {
      ...state.fee,
      [blockchain]: { range, timestamp: Date.now() },
    },
  };
}

function setSigned(state: TxStashState, { payload: { signed } }: SetSignedAction): TxStashState {
  return { ...state, signed };
}

function setStage(state: TxStashState, { payload: { stage } }: SetStageAction): TxStashState {
  return { ...state, stage };
}

function setTransaction(state: TxStashState, { payload: { transaction } }: SetTransactionAction): TxStashState {
  return { ...state, transaction };
}

export function reducer(state = INITIAL_STATE, action: TxStashAction): TxStashState {
  switch (action.type) {
    case ActionTypes.RESET:
      return reset(state);
    case ActionTypes.SET_ASSET:
      return setAsset(state, action);
    case ActionTypes.SET_ENTRY:
      return setEntry(state, action);
    case ActionTypes.SET_FEE_LOADING:
      return setFeeLoading(state, action);
    case ActionTypes.SET_FEE_RANGE:
      return setFeeRange(state, action);
    case ActionTypes.SET_SIGNED:
      return setSigned(state, action);
    case ActionTypes.SET_STAGE:
      return setStage(state, action);
    case ActionTypes.SET_TRANSACTION:
      return setTransaction(state, action);
    default:
      return state;
  }
}
