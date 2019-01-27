import React from 'react';
import { shallow } from 'enzyme';
import { HideAccountDialog, styles2 } from './hideAccountDialog';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

describe('HideAccountDialog', () => {
  it('renders without crash', () => {
    const component = shallow(<HideAccountDialog classes={classes} t={ () => ('') }/>);
  });
});
