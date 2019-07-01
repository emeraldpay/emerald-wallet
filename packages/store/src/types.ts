import {Dispatch} from "react";
import {IApi} from "@emeraldwallet/core";

export type State = {[key: string]: any};
export type GetState = () => State;
export type Dispatched<T> = (dispatch: Dispatch<T | Dispatched<T>>, getState: GetState, api: IApi) => void;