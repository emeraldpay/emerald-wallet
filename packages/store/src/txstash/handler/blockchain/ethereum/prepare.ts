import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  Blockchains,
  EthereumTransactionType,
  MAX_DISPLAY_ALLOWANCE,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
  workflow,
} from '@emeraldwallet/core';
import { TxTarget } from '@emeraldwallet/core/src/transaction/workflow';
import { TokenBalanceBelong, accounts, tokens } from '../../../..';
import { getTokens } from '../../../../application/selectors';
import { setAsset, setPreparing, setTransaction } from '../../../actions';
import { EntryHandler } from '../../types';
import { fetchFee } from './fee';

export const prepareErc20ApproveTx: EntryHandler<EthereumEntry> = (data, storeProvider) => () => {
  fetchFee(data, storeProvider)();

  const { entry, initialAllowance } = data;

  const state = storeProvider.getState();

  const blockchain = blockchainIdToCode(entry.blockchain);
  const tokenRegistry = new TokenRegistry(getTokens(state));

  const [{ address: tokenAddress }] = tokenRegistry.byBlockchain(blockchain);

  const createTx = new workflow.CreateErc20ApproveTx(tokenAddress, tokenRegistry, blockchain);

  if (initialAllowance == null) {
    createTx.approveBy = entry.address?.value;
  } else {
    const { allowance, ownerAddress, spenderAddress } = initialAllowance;

    if (ownerAddress !== entry.address?.value) {
      throw new Error(`Incorrect allowance provided for entry ${entry.id}`);
    }

    createTx.allowFor = spenderAddress;
    createTx.approveBy = ownerAddress;

    if (allowance.number.isGreaterThanOrEqualTo(MAX_DISPLAY_ALLOWANCE)) {
      createTx.target = workflow.ApproveTarget.INFINITE;
    } else {
      createTx.amount = allowance;
    }
  }

  createTx.totalBalance = accounts.selectors.getBalance(state, entry.id, amountFactory(blockchain)(0)) as WeiAny;

  const { value: address } = entry.address ?? {};

  if (address != null) {
    const { token } = createTx;

    createTx.totalTokenBalance =
      tokens.selectors.selectBalance(state, blockchain, address, token.address, {
        belonging: TokenBalanceBelong.OWN,
      }) ?? token.getAmount(0);
  }

  storeProvider.dispatch(setAsset(createTx.asset));
  storeProvider.dispatch(setTransaction(createTx.dump()));
  storeProvider.dispatch(setPreparing(false));
};

export const prepareErc20ConvertTx: EntryHandler<EthereumEntry> = (data, storeProvider) => () => {
  fetchFee(data, storeProvider)();

  const { entry } = data;

  const state = storeProvider.getState();

  const blockchain = blockchainIdToCode(entry.blockchain);
  const tokenRegistry = new TokenRegistry(getTokens(state));

  const createTx = new workflow.CreateErc20ConvertTx(blockchain, tokenRegistry);

  createTx.totalBalance = accounts.selectors.getBalance(state, entry.id, amountFactory(blockchain)(0)) as WeiAny;

  const { value: address } = entry.address ?? {};

  if (address != null) {
    const { token } = createTx;

    createTx.address = address;

    createTx.totalTokenBalance =
      tokens.selectors.selectBalance(state, blockchain, address, token.address, {
        belonging: TokenBalanceBelong.OWN,
      }) ?? token.getAmount(0);
  }

  storeProvider.dispatch(setAsset(createTx.asset));
  storeProvider.dispatch(setTransaction(createTx.dump()));
  storeProvider.dispatch(setPreparing(false));
};

export const prepareEthereumRecoveryTx: EntryHandler<EthereumEntry> = (data, storeProvider) => () => {
  fetchFee(data, storeProvider)();

  const { entries, entry } = data;

  const { value: address } = entry.address ?? {};

  if (address == null) {
    throw new Error(`Address for entry ${entry.id} not found`);
  }

  const state = storeProvider.getState();

  const blockchain = blockchainIdToCode(entry.blockchain);

  const balance = accounts.selectors.getBalance(state, entry.id, amountFactory(blockchain)(0)) as WeiAny;

  if (balance.isZero()) {
    throw new Error(`Can't create recovery transaction with zero balance for entry ${entry.id} `);
  }

  const [tokenBalance] = tokens.selectors
    .selectBalances(storeProvider.getState(), blockchain, address, { belonging: TokenBalanceBelong.OWN })
    .filter((balance) => balance.isPositive());

  const { eip1559: supportEip1559 = false } = Blockchains[blockchain].params;

  const txType = supportEip1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;

  let createTx: workflow.CreateEtherRecoveryTx | workflow.CreateErc20RecoveryTx;

  if (tokenBalance == null) {
    createTx = new workflow.CreateEtherRecoveryTx(null, blockchain, txType);

    createTx.totalBalance = balance;
  } else {
    const tokenRegistry = new TokenRegistry(getTokens(state));

    createTx = new workflow.CreateErc20RecoveryTx(tokenBalance.token.address, tokenRegistry, blockchain, txType);

    createTx.totalBalance = balance;
    createTx.totalTokenBalance = tokenBalance;
  }

  const recoveryEntry = entries.find(
    ({ blockchain, receiveDisabled }) => !receiveDisabled && blockchain === entry.blockchain,
  );

  createTx.from = address;
  createTx.target = TxTarget.SEND_ALL;
  createTx.to = recoveryEntry?.address?.value;

  createTx.rebalance();

  storeProvider.dispatch(setAsset(createTx.getAsset()));
  storeProvider.dispatch(setTransaction(createTx.dump()));
  storeProvider.dispatch(setPreparing(false));
};

export const prepareEthereumTx: EntryHandler<EthereumEntry> = (data, storeProvider) => () => {
  fetchFee(data, storeProvider)();

  storeProvider.dispatch(setPreparing(false));
};
