import { IApi } from '@emeraldwallet/core';
import { Dispatch } from 'react';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

export interface IState {[key: string]: any;}
export type GetState = () => IState;
export type Dispatched<T> = (dispatch: Dispatch<T | Dispatched<T>>, getState: GetState, api: IApi) => void;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, IState, null, Action<string>>;
