import * as React from 'react';
import { shallow } from 'enzyme';
import { TokenField } from './TokenField';

const reduceClasses = (prev: any, curr: any) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys({container:{}}).reduce(reduceClasses, {});

describe('TokenField', () => {
  it('renders without crash', () => {
    const wrapper = shallow(<TokenField classes={classes} selectedToken="ETC" tokenSymbols={["ETC"]}/>);
    expect(wrapper).toBeDefined();
  });

  it('should not crash without onChange handler', () => {
    const wrapper = shallow<TokenField>(<TokenField classes={classes} selectedToken="ETC" tokenSymbols={["ETC"]}/>);
    wrapper.instance().onChangeToken({target: { value: "ETC"}});
  });
});
