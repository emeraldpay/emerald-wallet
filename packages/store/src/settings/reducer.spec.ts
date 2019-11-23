import { setRatesAction } from './actions';
import settingsReducers from './reducer';
import { fiatCurrency, fiatRate } from './selectors';
import { ActionTypes } from './types';

const asGlobal = (settingsState: any): any => ({ wallet: { settings: settingsState } });

describe('settingsReducers', () => {
  it('should reset fiat rates after locale currency change', () => {
    // prepare
    let state = settingsReducers(undefined, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: 'EUR'
    });
    state = settingsReducers(state, setRatesAction(
      {
        ETC: 5,
        ETH: 10
      }
    ));
    expect(fiatRate('ETC', asGlobal(state))).toEqual(5);
    expect(fiatRate('ETH', asGlobal(state))).toEqual(10);

    // do
    state = settingsReducers(state, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: 'RUR'
    });

    // assert
    expect(fiatRate('ETC', asGlobal(state))).toBeNull();
    expect(fiatRate('ETH', asGlobal(state))).toBeNull();
  });

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
    expect(fiatRate('ETC', asGlobal(state))).toEqual(5);
    expect(fiatRate('ETH', asGlobal(state))).toEqual(10);
  });

  it('should store locale currency in uppercase', () => {
    // prepare
    // do
    const state = settingsReducers(undefined, {
      type: ActionTypes.SET_LOCALE_CURRENCY,
      currency: 'eur'
    });

    // assert
    expect(fiatCurrency(asGlobal(state))).toEqual('EUR');
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
