import { IApi } from '@emeraldwallet/core';
import { ipcRenderer } from 'electron';
import { fromJS } from 'immutable';
import { refreshTrackedTransactions } from './actions';
import {State} from "../types";

describe('historyActions/refreshTrackedTransactions', () => {
  const getState = () => ({
    blockchains: fromJS({
      eth: {
        height: 100
      }
    }),
    wallet: {
      settings: fromJS({
        numConfirmations: 10
      }),
      history: fromJS({
        chainId: 'kovan',
        trackedTransactions: [{ numConfirmations: 0, hash: '0x123', blockchain: 'ETH' }]
      })
    }
  } as State);

  it('should subscribe through electron', () => {
    const dispatch = jest.fn();
    const hash = '0x123';

    refreshTrackedTransactions()(dispatch, getState, {} as IApi);

    expect(ipcRenderer.send).toHaveBeenCalledWith('subscribe-tx', 'ETH', '0x123');
  });
});
