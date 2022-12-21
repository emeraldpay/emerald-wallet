import { BigAmount } from '@emeraldpay/bigamount';
import { BlockchainCode, TokenRegistry } from '@emeraldwallet/core';
import { TokenBalance, TokensState, moduleName } from './types';
import { IState } from '../types';

export function selectBalances(state: IState, blockchain: BlockchainCode, address: string): BigAmount[] | undefined {
  const balancesByBlockchains = state[moduleName] as TokensState;

  if (balancesByBlockchains[blockchain] != null) {
    const { [blockchain]: blockchainBalances } = balancesByBlockchains;

    if (blockchainBalances != null) {
      const { [address]: addressBalance } = blockchainBalances;

      if (addressBalance != null) {
        const values: TokenBalance[] = Object.values(addressBalance);

        const tokenRegistry = new TokenRegistry(state.application.tokens);

        return values.map((token) => tokenRegistry.bySymbol(blockchain, token.symbol).getAmount(token.unitsValue));
      }
    }
  }

  return undefined;
}

export function selectBalance(
  state: IState,
  blockchain: BlockchainCode,
  address: string,
  tokenAddress: string,
): BigAmount | undefined {
  const balancesByBlockchains = state[moduleName] as TokensState;

  if (balancesByBlockchains != null) {
    const { [blockchain]: blockchainBalances } = balancesByBlockchains;

    if (blockchainBalances != null) {
      const { [address]: addressBalance } = blockchainBalances;

      if (addressBalance != null) {
        const { [tokenAddress]: token } = addressBalance;

        if (token != null) {
          const tokenRegistry = new TokenRegistry(state.application.tokens);

          return tokenRegistry.bySymbol(blockchain, token.symbol).getAmount(token.unitsValue);
        }
      }
    }
  }

  return undefined;
}
