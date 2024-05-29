import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { Blockchains, blockchainCodeToId, isBitcoin } from '@emeraldwallet/core';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Action } from 'redux';
import { SagaIterator } from 'redux-saga';
import { setAddresses } from './actions';
import { ActionTypes, LoadAddressesAction } from './types';

function* loadAddresses(
  vault: IEmeraldVault,
  { payload: { account: accountId, blockchain, seed, index = 0 } }: LoadAddressesAction,
): SagaIterator {
  const baseHdPath = Blockchains[blockchain.toLowerCase()].params.hdPath.forAccount(accountId).forIndex(index);

  const hdPaths = [baseHdPath.toString()];

  if (isBitcoin(blockchain)) {
    hdPaths.push(baseHdPath.asAccount().toString());
  }

  let addresses: { [hdPath: string]: string } = {};

  try {
    addresses = yield call([vault, vault.listSeedAddresses], seed, blockchainCodeToId(blockchain), hdPaths);
  } catch (exception) {
    console.warn('Failed to get addresses', exception);
  }

  yield put(setAddresses(seed, blockchain, addresses) as unknown as Action);
}

export function* root(vault: IEmeraldVault): Generator<unknown> {
  yield takeEvery(ActionTypes.LOAD_ADDRESSES, loadAddresses, vault);
}
