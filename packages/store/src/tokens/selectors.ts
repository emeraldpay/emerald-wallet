import { BigAmount } from '@emeraldpay/bigamount';
import { BlockchainCode, TokenRegistry } from '@emeraldwallet/core';
import { IState } from '../types';
import { TokensState, moduleName } from './types';

export function selectBalances(state: IState, blockchain: BlockchainCode, address: string): BigAmount[] | undefined {
  const balancesByBlockchains = state[moduleName] as TokensState;

  if (balancesByBlockchains[blockchain] != null) {
    const { [blockchain]: blockchainBalances } = balancesByBlockchains;

    if (blockchainBalances != null) {
      const { [address]: addressBalance } = blockchainBalances;

      if (addressBalance != null) {
        const tokenRegistry = new TokenRegistry(state.application.tokens);

        return tokenRegistry
          .byAddresses(blockchain, Object.keys(addressBalance))
          .map((token) => token.getAmount(addressBalance[token.address].unitsValue));
      }
    }
  }

  return undefined;
}

export function selectBalance(
  state: IState,
  blockchain: BlockchainCode,
  address: string,
  contractAddress: string,
): BigAmount | undefined {
  const balancesByBlockchains = state[moduleName] as TokensState;

  if (balancesByBlockchains != null) {
    const { [blockchain]: blockchainBalances } = balancesByBlockchains;

    if (blockchainBalances != null) {
      const { [address]: addressBalance } = blockchainBalances;

      if (addressBalance != null) {
        const { [contractAddress]: tokenBalance } = addressBalance;

        if (tokenBalance != null) {
          const tokenRegistry = new TokenRegistry(state.application.tokens);

          if (tokenRegistry.hasAddress(blockchain, contractAddress)) {
            return tokenRegistry.byAddress(blockchain, contractAddress).getAmount(tokenBalance.unitsValue);
          }
        }
      }
    }
  }

  return undefined;
}
