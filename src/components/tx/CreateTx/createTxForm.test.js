import React from 'react';
import { shallow } from 'enzyme';
import BigNumber from 'bignumber.js';
import TokenUnits from 'lib/tokenUnits';
import { Currency } from 'lib/currency';
import { CreateTxForm } from './createTxForm';


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
    showFiat={ true }
    fiatRate={ fiatRate }
    fiatCurrency="usd"
    balance={ balance }
    value='1.23456789'
    accounts={ [] }
    tokens={ [] }
  />);

  expect(component.findWhere((n) => n.text() === fiatText)).toHaveLength(2);
});
