import { fireEvent, render, waitForElement } from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect'
import * as React from 'react';
import { styles, TopBar } from './TopBar';

const reduceClasses = (prev: any, curr: any) => ({ ...prev,  [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('TopBar', () => {
  it('creates without crash', () => {
    const wrapper = render(<TopBar classes={classes} />);
    expect(wrapper.getByTestId('accounts-btn')).toBeDefined();
    expect(wrapper.getByTestId('new-contact-btn')).toBeDefined();
  });
});
