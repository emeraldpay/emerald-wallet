import { CurrencyCode } from '@emeraldwallet/core';
import { INITIAL_STATE as APPLICATION_STATE } from '../application/reducer';
import { IState } from '../types';
import { setRates } from './actions';
import reducer from './reducer';
import { fiatCurrency, fiatRate } from './selectors';
import { ActionTypes, SettingsState } from './types';

const withGlobalState = (settings: SettingsState): IState =>
  ({ application: APPLICATION_STATE, settings } as unknown as IState);

describe('settingsReducers', () => {
  it('should reset fiat rates after locale currency change', () => {
    let state = reducer(undefined, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: CurrencyCode.EUR,
    });

    state = reducer(
      state,
      setRates({
        ETC: '5',
        ETH: '10',
      }),
    );

    expect(fiatRate(withGlobalState(state), 'ETC')).toEqual(5);
    expect(fiatRate(withGlobalState(state), 'ETH')).toEqual(10);

    state = reducer(state, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: CurrencyCode.RUB,
    });

    expect(fiatRate(withGlobalState(state), 'ETC')).toBeUndefined();
    expect(fiatRate(withGlobalState(state), 'ETH')).toBeUndefined();
  });

  it('EXCHANGE_RATES should update locale currency rate', () => {
    let state = reducer(undefined, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: 'EUR',
    });

    state = reducer(
      state,
      setRates({
        ETC: '5',
        ETH: '10',
      }),
    );

    expect(fiatRate(withGlobalState(state), 'ETC')).toEqual(5);
    expect(fiatRate(withGlobalState(state), 'ETH')).toEqual(10);
  });

  it('should store locale currency in uppercase', () => {
    const state = reducer(undefined, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: 'eur',
    });

    expect(fiatCurrency(withGlobalState(state))).toEqual('EUR');
  });
});
