import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { BackendApi, Blockchains, amountFactory, blockchainCodeToId, isBitcoin } from '@emeraldwallet/core';
import { all, call, put, takeEvery } from '@redux-saga/core/effects';
import { Action } from 'redux';
import { SagaIterator } from 'redux-saga';
import * as actions from './actions';
import { ActionTypes, ILoadAddresses, ILoadBalances } from './types';

function* loadAddresses(vault: IEmeraldVault, action: ILoadAddresses): SagaIterator {
  const { account: accountId, assets, blockchain, seed, index = 0 } = action;

  const blockchainDetails = Blockchains[blockchain.toLowerCase()];
  const baseHdPath = blockchainDetails.params.hdPath.forAccount(accountId).forIndex(index);

  const hdPaths = [baseHdPath.toString()];

  if (isBitcoin(blockchain)) {
    hdPaths.push(baseHdPath.asAccount().toString());
  }

  let addresses: { [p: string]: string } = {};

  try {
    addresses = yield call([vault, vault.listSeedAddresses], seed, blockchainCodeToId(blockchain), hdPaths);
  } catch (exception) {
    console.warn('Failed to get addresses', exception);
  }

  // Saga doesn't support thunk action, so we make conversion to unknown type and then to Action type
  yield put(actions.setAddresses(seed, blockchain, addresses) as unknown as Action);

  for (const address of Object.values(addresses)) {
    yield put(actions.loadBalances(blockchain, address, assets));
  }
}

function* loadBalances(backendApi: BackendApi, action: ILoadBalances): SagaIterator {
  const amountReader = amountFactory(action.blockchain);

  const balance: { [key: string]: string } = yield call(
    [backendApi, backendApi.getBalance],
    action.blockchain,
    action.address,
    action.assets,
  );

  for (const asset of Object.keys(balance)) {
    yield put(actions.setBalance(action.blockchain, action.address, asset, amountReader(balance[asset]).encode()));
  }
}

export function* root(vault: IEmeraldVault, backendApi: BackendApi): Generator<unknown> {
  yield all([
    takeEvery(ActionTypes.LOAD_ADDRESSES, loadAddresses, vault),
    takeEvery(ActionTypes.LOAD_BALANCES, loadBalances, backendApi),
  ]);
}
