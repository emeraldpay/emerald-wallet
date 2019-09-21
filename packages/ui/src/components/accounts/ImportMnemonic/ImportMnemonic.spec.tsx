import { shallow } from 'enzyme';
import * as React from 'react';
import { ImportMnemonic, styles } from './ImportMnemonic';

const reduceClasses = (prev, curr) => ({ ...prev,  [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('ImportMnemonic', () => {
  it('renders without crash', () => {
    const component = shallow(<ImportMnemonic classes={classes} blockchains={[]} initialValues={{ hdpath: "m/44'/60'/0'/0" }}/>);
    expect(component).toBeDefined();
  });
});
