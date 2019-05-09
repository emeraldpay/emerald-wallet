import * as React from 'react';
import { shallow } from 'enzyme';
import { ContactForm, styles } from './ContactForm';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('ContactForm', () => {
  it('renders without crash', () => {
    const component = shallow(<ContactForm classes={classes} />);
    expect(component).toBeDefined();
  });
});
