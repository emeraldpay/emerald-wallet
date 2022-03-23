import {IBackendApi} from '@emeraldwallet/core';
import {all} from 'redux-saga/effects';

export function* root (api: IBackendApi) {
  yield all([]);
}
