import '@testing-library/jest-dom/extend-expect';
import { WeiEtc } from '@emeraldpay/bigamount-crypto';
import { Theme } from '@emeraldwallet/ui';
import { ThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import { shallow } from 'enzyme';
import * as React from 'react';
import SelectAsset, { SelectAsset as SelectAssetBase } from './SelectAsset';

describe('SelectAsset', () => {
  const assets = [{ balance: WeiEtc.fromEther(350000), symbol: 'ETC' }];

  it('renders without crash', () => {
    const wrapper = shallow(
      <ThemeProvider theme={Theme}>
        <SelectAsset asset="ETC" assets={assets} />,
      </ThemeProvider>,
    );

    expect(wrapper).toBeDefined();
  });

  it('should not crash without onChange handler', () => {
    const wrapper = shallow<SelectAssetBase>(<SelectAssetBase asset="ETC" assets={assets} classes={{}} />);

    wrapper.instance().onChangeToken({ target: { value: 'ETC' } } as React.ChangeEvent<HTMLInputElement>);
  });

  it('should render total balance', async () => {
    const component = render(
      <ThemeProvider theme={Theme}>
        <SelectAsset asset="ETC" assets={assets} balance={new WeiEtc(350000)} />,
      </ThemeProvider>,
    );

    const balanceDiv = await component.findByTestId('balance');

    expect(balanceDiv).toHaveTextContent(new RegExp(/350/));
  });
});
