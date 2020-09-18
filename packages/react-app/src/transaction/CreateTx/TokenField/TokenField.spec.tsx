// tslint:disable-next-line:no-submodule-imports
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { shallow } from 'enzyme';
import * as React from 'react';
import {TokenField} from './TokenField';
import {Wei} from "@emeraldpay/bigamount-crypto";

const reduceClasses = (prev: any, curr: any) => ({ ...prev, [curr]: curr });
const classes = Object.keys({ container: {} }).reduce(reduceClasses, {});

describe('TokenField', () => {
  it('renders without crash', () => {
    const wrapper = shallow(<TokenField classes={classes} selectedToken='ETC' tokenSymbols={['ETC']}/>);
    expect(wrapper).toBeDefined();
  });

  it('should not crash without onChange handler', () => {
    const wrapper = shallow<TokenField>(<TokenField classes={classes} selectedToken='ETC' tokenSymbols={['ETC']}/>);
    wrapper.instance().onChangeToken({ target: { value: 'ETC' } });
  });

  it('should render total balance', async () => {
    const component = render(<TokenField classes={classes} selectedToken='ETC' tokenSymbols={[]}
                                         balance={new Wei(350000)}/>);
    const balanceDiv = await component.findByTestId('balance');
    expect(balanceDiv).toHaveTextContent(new RegExp(/350/));
  });
});
