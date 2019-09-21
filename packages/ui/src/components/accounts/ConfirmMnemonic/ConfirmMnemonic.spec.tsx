import { shallow } from 'enzyme';
import * as React from 'react';
import { ConfirmMnemonic, styles2 } from './ConfirmMnemonic';

const reduceClasses = (prev, curr) => ({ ...prev,  [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

describe('ConfirmMnemonic', () => {
  it('renders without crash', () => {
    const component = shallow(<ConfirmMnemonic mnemonic='mnemonic phrase' classes={classes} />);
    expect(component).toBeDefined();
  });
});
