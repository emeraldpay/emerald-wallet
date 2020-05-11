import { render } from '@testing-library/react';
import * as React from 'react';
import Filter from './Filter';

describe('Filter', () => {
  it('should renders', () => {
    const component = render(<Filter value='1'/>);
    expect(component).toBeDefined();
  });
});
