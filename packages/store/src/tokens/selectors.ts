import { BlockchainCode, TokenAmount, TokenRegistry } from '@emeraldwallet/core';
import { IState } from '../types';
import { TokensState, moduleName } from './types';

export function aggregateBalances(balances: TokenAmount[]): TokenAmount[] {
  return balances.reduce<TokenAmount[]>((carry, balance) => {
    const index = carry.findIndex(({ token: { address } }) => address === balance.token.address);

    if (index > -1) {
      carry[index] = carry[index].plus(balance);
    } else {
      carry.push(balance);
    }

    return carry;
  }, []);
}

export function selectBalances(state: IState, blockchain: BlockchainCode, address: string): TokenAmount[] | undefined {
  const balancesByBlockchains = state[moduleName] as TokensState;

  if (balancesByBlockchains[blockchain] != null) {
    const { [blockchain]: blockchainBalances } = balancesByBlockchains;

    if (blockchainBalances != null) {
      const { [address.toLowerCase()]: addressBalance } = blockchainBalances;

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
): TokenAmount | undefined {
  const balancesByBlockchains = state[moduleName] as TokensState;

  if (balancesByBlockchains != null) {
    const { [blockchain]: blockchainBalances } = balancesByBlockchains;

    if (blockchainBalances != null) {
      const { [address.toLowerCase()]: addressBalance } = blockchainBalances;

      if (addressBalance != null) {
        const { [contractAddress.toLowerCase()]: tokenBalance } = addressBalance;

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
