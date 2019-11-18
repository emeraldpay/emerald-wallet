import { setRatesAction } from './actions';
import settingsReducers from './reducer';
import { ActionTypes } from './types';

describe('settingsReducers', () => {
  it('EXCHANGE_RATES should update locale currency rate', () => {
    // prepare
    let state = settingsReducers(undefined, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: 'EUR'
    });

    // do
    state = settingsReducers(state, setRatesAction(
      {
        ETC: 5,
        ETH: 10
      }
    ));

    // assert
    expect(state.get('localeRate')).toEqual(5);
  });

  it('should store locale currency in uppercase', () => {
    // prepare
    // do
    const state = settingsReducers(undefined, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: 'eur'
    });

    // assert
    expect(state.get('localeCurrency')).toEqual('EUR');
  });

  it('SET_SHOW_HIDDEN_ACCOUNTS should update state', () => {
    // prepare
    // do
    const state = settingsReducers(undefined, {
      type: ActionTypes.SET_SHOW_HIDDEN_ACCOUNTS,
      show: true
    });

    // assert
    expect(state.get('showHiddenAccounts')).toEqual(true);
  });
});
