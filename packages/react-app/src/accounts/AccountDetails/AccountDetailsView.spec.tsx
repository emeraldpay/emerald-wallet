import * as React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { AccountShow, styles } from './AccountDetailsView';

const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});


describe("AccountDetailsView", () => {
  it('Shows HD path for hardware account', () => {
    const account = fromJS({
      id: '0x1234',
      hardware: true,
      hdpath: 'HD/PATH',
      blockchain: 'etc',
    });
    const wrapper = shallow(<AccountShow showFiat={false} classes={classes} account={account}/>);
    expect(wrapper).toBeDefined();
  });
});



