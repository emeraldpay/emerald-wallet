import {Blockchains, IBackendApi, HDPath, AnyCoinCode, IVault, blockchainCodeToId} from "@emeraldwallet/core";
import {SagaIterator} from "redux-saga";
import {all, call, put, takeEvery, takeLatest} from "@redux-saga/core/effects";
import {ActionTypes, ILoadAddresses, ILoadBalances} from "./types";
import * as actions from "./actions";
import {getBlockchainType} from "@emeraldpay/emerald-vault-core";

function* loadAddresses(vault: IVault, action: ILoadAddresses): SagaIterator {
  const accountId = action.account;
  for (const blockchain of action.blockchains) {
    const blockchainDetails = Blockchains[blockchain.toLowerCase()];
    const hdpath = blockchainDetails.params.hdPath.forAccount(accountId).toString();
    const addresses: { [key: string]: string } = yield call([vault, vault.listSeedAddresses],
      action.seed,
      getBlockchainType(blockchainCodeToId(blockchain)),
      [hdpath]
    );
    yield put(actions.setAddresses(action.seed, blockchain, addresses))
    for (const address of Object.values(addresses)) {
      yield put(actions.loadBalances(blockchain, address, blockchainDetails.getAssets()))
    }
  }
}

function* loadBalances(backendApi: IBackendApi, action: ILoadBalances): SagaIterator {
  const balance: { [key in AnyCoinCode]: string } = yield call([backendApi, backendApi.getBalance], action.blockchain, action.address, action.assets)
  for (const asset of Object.keys(balance)) {
    yield put(actions.setBalance(action.blockchain, action.address, asset as AnyCoinCode, balance[asset as AnyCoinCode]))
  }
}

export function* root(vault: IVault, backendApi: IBackendApi) {
  yield all([
    takeEvery(ActionTypes.LOAD_ADDRESSES, loadAddresses, vault),
    takeEvery(ActionTypes.LOAD_BALANCES, loadBalances, backendApi)
  ]);
}