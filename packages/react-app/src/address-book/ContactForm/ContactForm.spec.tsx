import { shallow } from 'enzyme';
import * as React from 'react';
import { ContactForm, styles } from './ContactForm';

const reduceClasses = (prev: any, curr: any) => ({...prev,  [curr]: curr});
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('ContactForm', () => {
  it('renders without crash', () => {
    const component = shallow(<ContactForm classes={classes} />);
    expect(component).toBeDefined();
  });
});
