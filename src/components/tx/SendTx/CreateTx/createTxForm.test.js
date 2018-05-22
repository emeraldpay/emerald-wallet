import React from 'react';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import BigNumber from 'bignumber.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import theme from 'emerald-js-ui/src/theme.json';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import TokenUnits from 'lib/tokenUnits';
import { Currency } from 'lib/currency';
import { CreateTxForm, default as CreateTxFormRedux } from './createTxForm';
import { createStore } from '../../../../store/store';

const mockMuiTheme = {
  palette: {},
};

const muiTheme = getMuiTheme(theme);

test('redux form instance', () => {
  const store = createStore(null);
  const instance = mount(
    <Provider store={store}>
      <MuiThemeProvider muiTheme={muiTheme}>
        <CreateTxFormRedux
          balance={{symbol: '', value: 0}}
          tokens={[]}
          accounts={[]}
        />
      </MuiThemeProvider>
    </Provider>);
});

test('It shows tx value in fiat', () => {
  const tokenValue = new TokenUnits(new BigNumber(123456789), 8);
  const fiatRate = 1.5;
  const fiatValue = tokenValue.convert(fiatRate, 8);
  const fiatText = Currency.format(fiatValue, 'usd');
  const balance = {
    symbol: 'ETC',
    value: tokenValue,
  };

  const component = shallow(<CreateTxForm
    muiTheme={mockMuiTheme}
    showFiat={ true }
    fiatRate={ fiatRate }
    fiatCurrency="usd"
    balance={ balance }
    value='1.23456789'
    accounts={ [] }
    addressBook={ [] }
    tokens={ [] }
  />);

  expect(component.findWhere((n) => n.text() === fiatText)).toHaveLength(2);
});
