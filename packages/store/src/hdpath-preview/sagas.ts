import { IEmeraldVault } from '@emeraldpay/emerald-vault-core';
import {
  AnyCoinCode,
  Blockchains,
  IBackendApi,
  amountFactory,
  blockchainCodeToId,
  isBitcoin,
} from '@emeraldwallet/core';
import { CoinTicker } from '@emeraldwallet/core/lib/blockchains/CoinTicker';
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

function* loadBalances(backendApi: IBackendApi, { address, assets, blockchain }: ILoadBalances): SagaIterator {
  const amountReader = amountFactory(blockchain);

  const balance: { [key in AnyCoinCode]: string } = yield call(
    backendApi.getBalance,
    blockchain,
    address,
    assets.map((asset) => (asset === CoinTicker.ETH ? ('ETHER' as AnyCoinCode) : asset)),
  );

  for (const asset of Object.keys(balance)) {
    yield put(
      actions.setBalance(
        blockchain,
        address,
        asset === 'ETHER' ? CoinTicker.ETH : (asset as AnyCoinCode),
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
