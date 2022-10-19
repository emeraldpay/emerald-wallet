// tslint:disable-next-line:no-submodule-imports
import '@testing-library/jest-dom/extend-expect';
import { WeiEtc } from '@emeraldpay/bigamount-crypto';
import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import { shallow } from 'enzyme';
import * as React from 'react';
import { TokenField } from './TokenField';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reduceClasses = <T,>(prev: T, curr: any): T => ({ ...prev, [curr]: curr });
const classes = Object.keys({ container: {} }).reduce(reduceClasses, {});

describe('TokenField', () => {
  it('renders without crash', () => {
    const wrapper = shallow(
      <TokenField
        classes={classes}
        selectedToken="ETC"
        tokenSymbols={['ETC']}
        getBalanceByToken={() => new WeiEtc(1350000)}
      />,
    );

    expect(wrapper).toBeDefined();
  });

  it('should not crash without onChange handler', () => {
    const wrapper = shallow<TokenField>(
      <TokenField
        classes={classes}
        selectedToken="ETC"
        tokenSymbols={['ETC']}
        getBalanceByToken={() => new WeiEtc(350000)}
      />,
    );

    wrapper.instance().onChangeToken({ target: { value: 'ETC' } } as React.ChangeEvent<HTMLInputElement>);
  });

  it('should render total balance', async () => {
    const component = render(
      <ThemeProvider theme={Theme}>
        <TokenField
          classes={classes}
          balance={new WeiEtc(350000)}
          selectedToken="ETC"
          tokenSymbols={[]}
          getBalanceByToken={() => new WeiEtc(350000)}
        />
        ,
      </ThemeProvider>,
    );

    const balanceDiv = await component.findByTestId('balance');

    expect(balanceDiv).toHaveTextContent(new RegExp(/350/));
  });
});
