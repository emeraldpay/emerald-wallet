import React from 'react';
import { shallow } from 'enzyme';
import { WaitConnectionDialog, styles2 } from './waitDialog';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

test('Creation works', () => {
  const component = shallow(<WaitConnectionDialog classes={classes} />);
});
