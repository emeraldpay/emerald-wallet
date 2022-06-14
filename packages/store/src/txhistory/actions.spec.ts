import { BlockchainCode, blockchainCodeToId, CurrencyCode } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import rootReducer from '../root-reducer';
import { IExtraArgument, IState } from '../types';
import { refreshTrackedTransactions } from './actions';

describe('historyActions/refreshTrackedTransactions', () => {
  let state = rootReducer(undefined, { type: '' });

  state = {
    ...state,
    blockchains: {
      eth: {
        height: 100,
      },
    },
    history: {
      transactions: new Map<string, any>(
        Object.entries({
          '0x123': {
            blockchain: blockchainCodeToId(BlockchainCode.ETH),
            txId: '0x123',
          },
        }),
      ),
    },
    settings: {
      localeCurrency: CurrencyCode.USD,
      mode: {
        chains: [],
        currencies: [],
        id: '',
      },
      rates: {},
    },
  };

  const getState = (): IState => state;

  it('should subscribe through electron', () => {
    refreshTrackedTransactions()(jest.fn(), getState, {} as IExtraArgument);

    expect(ipcRenderer.send).toHaveBeenCalledWith('subscribe-tx', 'eth', '0x123');
  });
});
