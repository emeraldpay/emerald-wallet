import { BlockchainCode } from '@emeraldwallet/core';
import * as actions from './actions';
import { reducer } from './reducer';
import * as selectors from './selectors';
import {ActionTypes, moduleName} from './types';
import {Wei} from '@emeraldpay/bigamount-crypto';

describe('blockchains reducer', () => {
  it('handles Actions.BLOCK', () => {
    let state = reducer(undefined, actions.blockAction({ hash: '', blockchain: 'etc', height: 112 }));
    expect(state[BlockchainCode.ETC]).toEqual({ gasPrice: null, height: 112 });
    state = reducer(state, { type: ActionTypes.BLOCK, payload: { blockchain: 'etc', height: 114 } });
    expect(state[BlockchainCode.ETC]).toEqual({ gasPrice: null, height: 114 });
  });

  it('handles Actions.GAS_PRICE', () => {
    const state = reducer(undefined, { type: ActionTypes.GAS_PRICE, payload: { blockchain: 'etc', gasPrice: new Wei(850000) } });
    expect(state[BlockchainCode.ETC]).toEqual({gasPrice: new Wei(850000), height: null});
    expect(selectors.gasPrice({[moduleName]: state}, 'etc').number.toFixed()).toEqual('850000');
  });
});
