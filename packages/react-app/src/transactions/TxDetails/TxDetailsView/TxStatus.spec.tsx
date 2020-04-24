import { shallow } from 'enzyme';
import * as React from 'react';
import { styles, TxStatus } from './TxStatus';

const reduceClasses = (prev: any, curr: any) => ({ ...prev,  [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('TxStatus', () => {
  it('should render without crash', () => {
    const wrapper = shallow(<TxStatus status='' classes={classes}/>);
    expect(wrapper).toBeDefined();
  });
});
