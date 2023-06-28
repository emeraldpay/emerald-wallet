import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { Blockchains, blockchainCodeToId, isBitcoin } from '@emeraldwallet/core';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Action } from 'redux';
import { SagaIterator } from 'redux-saga';
import * as actions from './actions';
import { ActionTypes, ILoadAddresses } from './types';

function* loadAddresses(
  vault: IEmeraldVault,
  { account: accountId, blockchain, seed, index = 0 }: ILoadAddresses,
): SagaIterator {
  const blockchainDetails = Blockchains[blockchain.toLowerCase()];
  const baseHdPath = blockchainDetails.params.hdPath.forAccount(accountId).forIndex(index);

  const hdPaths = [baseHdPath.toString()];

  if (isBitcoin(blockchain)) {
    hdPaths.push(baseHdPath.asAccount().toString());
  }

  let addresses: { [hdPath: string]: string } = {};

  try {
    addresses = yield call(vault.listSeedAddresses, seed, blockchainCodeToId(blockchain), hdPaths);
  } catch (exception) {
    console.warn('Failed to get addresses', exception);
  }

  yield put(actions.setAddresses(seed, blockchain, addresses) as unknown as Action);
}

export function* root(vault: IEmeraldVault): Generator<unknown> {
  yield takeEvery(ActionTypes.LOAD_ADDRESSES, loadAddresses, vault);
}
