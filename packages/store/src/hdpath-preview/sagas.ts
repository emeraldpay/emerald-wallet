import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import { BackendApi, Blockchains, amountFactory, blockchainCodeToId, isBitcoin } from '@emeraldwallet/core';
import { CoinTicker } from '@emeraldwallet/core/lib/blockchains/CoinTicker';
import { all, call, put, takeEvery } from '@redux-saga/core/effects';
import { Action } from 'redux';
import { SagaIterator } from 'redux-saga';
import * as actions from './actions';
import { ActionTypes, ILoadAddresses, ILoadBalances } from './types';

function* loadAddresses(
  vault: IEmeraldVault,
  { account: accountId, assets, blockchain, seed, index = 0 }: ILoadAddresses,
): SagaIterator {
  const blockchainDetails = Blockchains[blockchain.toLowerCase()];
  const baseHdPath = blockchainDetails.params.hdPath.forAccount(accountId).forIndex(index);

  const hdPaths = [baseHdPath.toString()];

  if (isBitcoin(blockchain)) {
    hdPaths.push(baseHdPath.asAccount().toString());
  }

  let addresses: { [p: string]: string } = {};

  try {
    addresses = yield call(vault.listSeedAddresses, seed, blockchainCodeToId(blockchain), hdPaths);
  } catch (exception) {
    console.warn('Failed to get addresses', exception);
  }

  // Saga doesn't support thunk action, so we make conversion to unknown type and then to Action type
  yield put(actions.setAddresses(seed, blockchain, addresses) as unknown as Action);

  for (const [hdpath, address] of Object.entries(addresses)) {
    yield put(actions.loadBalances(seed, blockchain, hdpath, address, assets));
  }
}

function* loadBalances(
  backendApi: BackendApi,
  { address, assets, blockchain, hdpath, seed }: ILoadBalances,
): SagaIterator {
  const amountReader = amountFactory(blockchain);

  const balances: { [key: string]: string } = yield call(
    backendApi.getBalance,
    blockchain,
    address,
    assets.map((asset) => (asset === CoinTicker.ETH ? 'ETHER' : asset)),
  );

  for (const asset of Object.keys(balances)) {
    yield put(
      actions.setBalance(
        seed,
        blockchain,
        hdpath,
        address,
        asset === 'ETHER' ? CoinTicker.ETH : asset,
        amountReader(balances[asset]).encode(),
      ),
    );
  }
}

export function* root(vault: IEmeraldVault, backendApi: BackendApi): Generator<unknown> {
  yield all([
    takeEvery(ActionTypes.LOAD_ADDRESSES, loadAddresses, vault),
    takeEvery(ActionTypes.LOAD_BALANCES, loadBalances, backendApi),
  ]);
}
