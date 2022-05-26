import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import {
  amountFactory,
  AnyCoinCode,
  blockchainCodeToId,
  Blockchains,
  IBackendApi,
  isBitcoin,
} from '@emeraldwallet/core';
import { all, call, put, takeEvery } from '@redux-saga/core/effects';
import { SagaIterator } from 'redux-saga';
import * as actions from './actions';
import { ActionTypes, ILoadAddresses, ILoadBalances } from './types';

function* loadAddresses(vault: IEmeraldVault, action: ILoadAddresses): SagaIterator {
  const { account: accountId, blockchain, index = 0 } = action;

  const blockchainDetails = Blockchains[blockchain.toLowerCase()];
  const baseHdPath = blockchainDetails.params.hdPath.forAccount(accountId).forIndex(index);

  const hdPaths = [baseHdPath.toString()];

  if (isBitcoin(blockchain)) {
    hdPaths.push(baseHdPath.asAccount().toString());
  }

  let addresses: { [p: string]: string } = {};

  try {
    addresses = yield call([vault, vault.listSeedAddresses], action.seed, blockchainCodeToId(blockchain), hdPaths);
  } catch (e) {
    console.warn('Failed to get addresses', e);
  }

  console.log('got addresses', addresses);

  yield put(actions.setAddresses(action.seed, blockchain, addresses));

  for (const address of Object.values(addresses)) {
    yield put(actions.loadBalances(blockchain, address, blockchainDetails.getAssets()));
  }
}

function* loadBalances(backendApi: IBackendApi, action: ILoadBalances): SagaIterator {
  const amountReader = amountFactory(action.blockchain);

  const balance: { [key in AnyCoinCode]: string } = yield call(
    [backendApi, backendApi.getBalance],
    action.blockchain,
    action.address,
    action.assets,
  );

  for (const asset of Object.keys(balance)) {
    yield put(
      actions.setBalance(
        action.blockchain,
        action.address,
        asset as AnyCoinCode,
        amountReader(balance[asset as AnyCoinCode]).encode(),
      ),
    );
  }
}

export function* root(vault: IEmeraldVault, backendApi: IBackendApi): Generator<unknown> {
  yield all([
    takeEvery(ActionTypes.LOAD_ADDRESSES, loadAddresses, vault),
    takeEvery(ActionTypes.LOAD_BALANCES, loadBalances, backendApi),
  ]);
}
