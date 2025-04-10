import '@testing-library/jest-dom/extend-expect';
import { WeiEtc } from '@emeraldpay/bigamount-crypto';
import { EmeraldTheme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import { shallow } from 'enzyme';
import * as React from 'react';
import SelectAsset from './SelectAsset';

describe('SelectAsset', () => {
  const assets = [{ balance: WeiEtc.fromEther(350000), symbol: 'ETC' }];

  it('renders without crash', () => {
    const wrapper = shallow(
      <ThemeProvider theme={EmeraldTheme}>
        <SelectAsset asset="ETC" assets={assets} />,
      </ThemeProvider>,
    );

    expect(wrapper).toBeDefined();
  });

  it('should render total balance', async () => {
    const component = render(
      <ThemeProvider theme={EmeraldTheme}>
        <SelectAsset asset="ETC" assets={assets} balance={new WeiEtc(350000)} />,
      </ThemeProvider>,
    );

    const balanceDiv = await component.findByTestId('balance');

    expect(balanceDiv).toHaveTextContent(new RegExp(/350/));
  });
});
