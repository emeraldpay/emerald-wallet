import { BlockchainCode, TokenAmount, TokenRegistry } from '@emeraldwallet/core';
import { Allowance, allowances, tokens } from '../index';
import { IState } from '../types';
import { TokenBalanceBelong, TokenBalanceFilter, moduleName } from './types';

export function isInitialized(state: IState): boolean {
  return state[moduleName].initialized;
}

export function selectBalance(
  state: IState,
  blockchain: BlockchainCode,
  address: string,
  contractAddress: string,
  filter?: TokenBalanceFilter,
): TokenAmount | undefined {
  const { [blockchain]: blockchainBalances } = state[moduleName].balances;

  if (blockchainBalances == null) {
    return undefined;
  }

  const tokenRegistry = new TokenRegistry(state.application.tokens);

  if (tokenRegistry.hasAddress(blockchain, contractAddress)) {
    const { belonging = TokenBalanceBelong.ANY, belongsTo } = filter ?? {};

    const token = tokenRegistry.byAddress(blockchain, contractAddress);

    const balanceAddress = address.toLowerCase();
    const balanceContractAddress = contractAddress.toLowerCase();
    const belongAddress = belongsTo?.toLowerCase();

    const { [balanceAddress]: tokenBalances } = blockchainBalances ?? {};
    const { [balanceContractAddress]: tokenBalance } = tokenBalances ?? {};

    const zeroAmount = token.getAmount(0);

    const balance = tokenBalance == null ? zeroAmount : token.getAmount(tokenBalance.unitsValue);

    if (belonging === TokenBalanceBelong.OWN) {
      return balance;
    }

    const allowed = allowances.selectors
      .getAddressAllowances(state, blockchain, balanceAddress)
      .filter(({ ownerAddress, spenderAddress }) => {
        const belongs = spenderAddress.toLowerCase() === balanceAddress;

        if (belongAddress == null) {
          return belongs;
        }

        return belongs && ownerAddress.toLowerCase() === belongAddress;
      })
      .find(({ allowance }) => allowance.token.address.toLowerCase() === balanceContractAddress);

    if (allowed == null) {
      if (belonging === TokenBalanceBelong.ALLOWED) {
        return undefined;
      }

      return balance;
    }

    const ownerBalance = tokens.selectors.selectBalance(
      state,
      blockchain,
      allowed.ownerAddress,
      allowed.allowance.token.address,
      { belonging: TokenBalanceBelong.OWN },
    );

    const availableBalance = allowed.allowance.min(ownerBalance ?? allowed.available);

    if (belonging === TokenBalanceBelong.ALLOWED) {
      return availableBalance;
    }

    return balance.plus(availableBalance);
  }

  return undefined;
}

export function selectBalances(
  state: IState,
  blockchain: BlockchainCode,
  address: string,
  filter?: TokenBalanceFilter,
): TokenAmount[] {
  const { belonging = TokenBalanceBelong.ANY, belongsTo } = filter ?? {};

  const balanceAddress = address.toLowerCase();
  const belongAddress = belongsTo?.toLowerCase();

  const { [blockchain]: blockchainBalances } = state[moduleName].balances;
  const { [balanceAddress]: tokenBalances } = blockchainBalances ?? {};

  if (tokenBalances == null && belonging === TokenBalanceBelong.OWN) {
    return [];
  }

  const allowanceByContractAddress = allowances.selectors
    .getAddressAllowances(state, blockchain, balanceAddress)
    .filter(({ ownerAddress, spenderAddress }) => {
      const belongs = spenderAddress.toLowerCase() === balanceAddress;

      if (belongAddress == null) {
        return belongs;
      }

      return belongs && ownerAddress.toLowerCase() === belongAddress;
    })
    .reduce<Map<string, Allowance>>(
      (carry, allowance) => carry.set(allowance.token.address.toLowerCase(), allowance),
      new Map(),
    );

  if (tokenBalances == null) {
    return [...allowanceByContractAddress.values()].map(({ allowance, available, ownerAddress }) => {
      const ownerBalance = tokens.selectors.selectBalance(state, blockchain, ownerAddress, allowance.token.address, {
        belonging: TokenBalanceBelong.OWN,
      });

      return allowance.min(ownerBalance ?? available);
    });
  }

  const tokenRegistry = new TokenRegistry(state.application.tokens);

  const balances = tokenRegistry.byAddresses(blockchain, Object.keys(tokenBalances)).map((token) => {
    const tokenBalance = tokenBalances[token.address];

    const zeroAmount = token.getAmount(0);

    if (tokenBalance == null) {
      return zeroAmount;
    }

    const balance = token.getAmount(tokenBalance.unitsValue);

    if (belonging === TokenBalanceBelong.OWN) {
      return balance;
    }

    const contractAddress = token.address.toLowerCase();

    const allowed = allowanceByContractAddress.get(contractAddress);

    if (allowed == null) {
      if (belonging === TokenBalanceBelong.ALLOWED) {
        return zeroAmount;
      }

      return balance;
    }

    allowanceByContractAddress.delete(contractAddress);

    const ownerBalance = tokens.selectors.selectBalance(
      state,
      blockchain,
      allowed.ownerAddress,
      allowed.available.token.address,
      { belonging: TokenBalanceBelong.OWN },
    );

    const availableBalance = allowed.allowance.min(ownerBalance ?? allowed.available);

    if (belonging === TokenBalanceBelong.ALLOWED) {
      return availableBalance;
    }

    return balance.plus(availableBalance);
  });

  if (belonging === TokenBalanceBelong.OWN) {
    return balances;
  }

  return balances.concat(
    [...allowanceByContractAddress.values()].map(({ allowance, available }) => allowance.max(available)),
  );
}
