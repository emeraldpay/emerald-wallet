import {
  ActionTypes,
  CreateTxStage,
  SetAssetAction,
  SetChangeAddressAction,
  SetEntryAction,
  SetFeeLoadingAction,
  SetFeeRangeAction,
  SetPreparingAction,
  SetSignedAction,
  SetStageAction,
  SetTransactionAction,
  SetTransactionFeeAction,
  TxStashAction,
  TxStashState,
} from './types';

const INITIAL_STATE: TxStashState = { preparing: true, stage: CreateTxStage.SETUP };

function reset({ fee }: TxStashState): TxStashState {
  return { ...INITIAL_STATE, fee };
}

function setAsset(state: TxStashState, { payload: { asset } }: SetAssetAction): TxStashState {
  return { ...state, asset };
}

function setChangeAddress(state: TxStashState, { payload: { changeAddress } }: SetChangeAddressAction): TxStashState {
  return { ...state, changeAddress };
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
  if (state.stage === CreateTxStage.SIGN) {
    return { ...state, signed };
  }

  return state;
}

function setPreparing(state: TxStashState, { payload: { preparing } }: SetPreparingAction): TxStashState {
  return { ...state, preparing };
}

function setStage(state: TxStashState, { payload: { stage } }: SetStageAction): TxStashState {
  if (state.stage < stage) {
    return { ...state, stage };
  }

  return state;
}

function setTransaction(state: TxStashState, { payload: { transaction } }: SetTransactionAction): TxStashState {
  if (state.stage === CreateTxStage.SETUP) {
    return { ...state, transaction };
  }

  return state;
}

function setTransactionFee(
  state: TxStashState,
  { payload: { transactionFee } }: SetTransactionFeeAction,
): TxStashState {
  return { ...state, transactionFee };
}

export function reducer(state = INITIAL_STATE, action: TxStashAction): TxStashState {
  switch (action.type) {
    case ActionTypes.RESET:
      return reset(state);
    case ActionTypes.SET_ASSET:
      return setAsset(state, action);
    case ActionTypes.SET_CHANGE_ADDRESS:
      return setChangeAddress(state, action);
    case ActionTypes.SET_ENTRY:
      return setEntry(state, action);
    case ActionTypes.SET_FEE_LOADING:
      return setFeeLoading(state, action);
    case ActionTypes.SET_FEE_RANGE:
      return setFeeRange(state, action);
    case ActionTypes.SET_PREPARING:
      return setPreparing(state, action);
    case ActionTypes.SET_SIGNED:
      return setSigned(state, action);
    case ActionTypes.SET_STAGE:
      return setStage(state, action);
    case ActionTypes.SET_TRANSACTION:
      return setTransaction(state, action);
    case ActionTypes.SET_TRANSACTION_FEE:
      return setTransactionFee(state, action);
    default:
      return state;
  }
}
