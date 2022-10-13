import { BigAmount } from '@emeraldpay/bigamount';
import { BlockchainCode, tokenAmount } from '@emeraldwallet/core';
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

        return values.map((token) => tokenAmount(token.unitsValue, token.symbol));
      }
    }
  }

  return undefined;
}

export function selectBalance(
  state: IState,
  blockchain: BlockchainCode,
  address: string,
  tokenId: string,
): BigAmount | undefined {
  const balancesByBlockchains = state[moduleName] as TokensState;

  if (balancesByBlockchains != null) {
    const { [blockchain]: blockchainBalances } = balancesByBlockchains;

    if (blockchainBalances != null) {
      const { [address]: addressBalance } = blockchainBalances;

      if (addressBalance != null) {
        const { [tokenId]: token } = addressBalance;

        if (token != null) {
          return tokenAmount(token.unitsValue, token.symbol);
        }
      }
    }
  }

  return undefined;
}
