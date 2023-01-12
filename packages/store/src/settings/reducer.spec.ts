import { CurrencyCode } from '@emeraldwallet/core';
import { setRates } from './actions';
import settingsReducers from './reducer';
import { fiatCurrency, fiatRate } from './selectors';
import { ActionTypes } from './types';

const asGlobal = (settingsState: any): any => ({ settings: settingsState });

describe('settingsReducers', () => {
  it('should reset fiat rates after locale currency change', () => {
    let state = settingsReducers(undefined, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: CurrencyCode.EUR,
    });

    state = settingsReducers(
      state,
      setRates({
        ETC: '5',
        ETH: '10',
      }),
    );

    expect(fiatRate(asGlobal(state), 'ETC')).toEqual(5);
    expect(fiatRate(asGlobal(state), 'ETH')).toEqual(10);

    state = settingsReducers(state, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: CurrencyCode.RUB,
    });

    expect(fiatRate(asGlobal(state), 'ETC')).toBeUndefined();
    expect(fiatRate(asGlobal(state), 'ETH')).toBeUndefined();
  });

  it('EXCHANGE_RATES should update locale currency rate', () => {
    let state = settingsReducers(undefined, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: 'EUR',
    });

    state = settingsReducers(
      state,
      setRates({
        ETC: '5',
        ETH: '10',
      }),
    );

    expect(fiatRate(asGlobal(state), 'ETC')).toEqual(5);
    expect(fiatRate(asGlobal(state), 'ETH')).toEqual(10);
  });

  it('should store locale currency in uppercase', () => {
    const state = settingsReducers(undefined, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: 'eur',
    });

    expect(fiatCurrency(asGlobal(state))).toEqual('EUR');
  });
});
