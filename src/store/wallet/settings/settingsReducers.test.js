import settingsReducers from './settingsReducers';
import ActionTypes from './actionTypes';

describe('settingsReducers', () => {
  it('EXCHANGE_RATES should update locale currency rate', () => {
    // prepare
    let state = settingsReducers(null, {});
    state = settingsReducers(state, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: 'EUR',
    });

    // do
    state = settingsReducers(state, {
      type: ActionTypes.EXCHANGE_RATES,
      rates: {
        EUR: 5,
        USD: 10,
      },
    });

    // assert
    expect(state.get('localeRate')).toEqual(5);
  });

  it('should store locale currency in uppercase', () => {
    // prepare
    let state = settingsReducers(null, {});
    // do
    state = settingsReducers(state, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: 'eur',
    });

    // assert
    expect(state.get('localeCurrency')).toEqual('EUR');
  });

  it('SET_SHOW_HIDDEN_ACCOUNTS should update state', () => {
    // prepare
    let state = settingsReducers(null, {});
    // do
    state = settingsReducers(state, {
      type: ActionTypes.SET_SHOW_HIDDEN_ACCOUNTS,
      show: true,
    });

    // assert
    expect(state.get('showHiddenAccounts')).toEqual(true);
  });
});
