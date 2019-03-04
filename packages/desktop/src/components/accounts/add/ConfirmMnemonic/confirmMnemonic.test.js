import React from 'react';
import { shallow } from 'enzyme';
import { ConfirmMnemonic, styles2 } from './confirmMnemonic';


const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

describe('ConfirmMnemonic', () => {
  it('renders without crash', () => {
    const component = shallow(<ConfirmMnemonic classes={classes} />);
  });
});
