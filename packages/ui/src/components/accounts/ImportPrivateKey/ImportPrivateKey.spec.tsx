import { shallow } from 'enzyme';
import * as React from 'react';
import { ImportPrivateKey, styles } from './ImportPrivateKey';

const reduceClasses = (prev, curr) => ({ ...prev,  [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('ImportPrivateKey', () => {
  it('renders without crash', () => {
    const component = shallow(<ImportPrivateKey classes={classes} blockchains={[]}/>);
    expect(component).toBeDefined();
  });
});
