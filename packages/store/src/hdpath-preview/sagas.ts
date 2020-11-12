import {Blockchains, IBackendApi, HDPath, AnyCoinCode, blockchainCodeToId, isBitcoin} from "@emeraldwallet/core";
import {SagaIterator} from "redux-saga";
import {all, call, put, takeEvery, takeLatest} from "@redux-saga/core/effects";
import {ActionTypes, ILoadAddresses, ILoadBalances} from "./types";
import * as actions from "./actions";
import {IEmeraldVault} from "@emeraldpay/emerald-vault-core";

function* loadAddresses(vault: IEmeraldVault, action: ILoadAddresses): SagaIterator {
  const accountId = action.account;
  const blockchain = action.blockchain;
  const getAccountXpub = isBitcoin(blockchain);
  const blockchainDetails = Blockchains[blockchain.toLowerCase()];
  const baseHdPath = blockchainDetails.params.hdPath.forAccount(accountId);
  const hdPaths = [
    baseHdPath.toString()
  ];
  if (getAccountXpub) {
    hdPaths.push(baseHdPath.asAccount().toString());
  }
  let addresses: { [p: string]: string } = {};
  try {
    addresses = yield call(
      [vault, vault.listSeedAddresses],
      action.seed,
      blockchainCodeToId(blockchain),
      hdPaths
    );
  } catch (e) {
    console.warn("Failed to get addresses", e)
  }
  console.log("got addresses", addresses);
  yield put(actions.setAddresses(action.seed, blockchain, addresses))
  for (const address of Object.values(addresses)) {
    yield put(actions.loadBalances(blockchain, address, blockchainDetails.getAssets()))
  }
}

function* loadBalances(backendApi: IBackendApi, action: ILoadBalances): SagaIterator {
  const balance: { [key in AnyCoinCode]: string } = yield call([backendApi, backendApi.getBalance], action.blockchain, action.address, action.assets)
  for (const asset of Object.keys(balance)) {
    yield put(actions.setBalance(action.blockchain, action.address, asset as AnyCoinCode, balance[asset as AnyCoinCode]))
  }
}

export function* root(vault: IEmeraldVault, backendApi: IBackendApi) {
  yield all([
    takeEvery(ActionTypes.LOAD_ADDRESSES, loadAddresses, vault),
    takeEvery(ActionTypes.LOAD_BALANCES, loadBalances, backendApi),
  ]);
}