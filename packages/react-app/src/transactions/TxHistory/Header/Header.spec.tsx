import { render } from '@testing-library/react';
import * as React from 'react';
import Header from './Header';

describe('Header', () => {
  it('should renders', () => {
    const component = render(<Header />);
    expect(component).toBeDefined();
  });
});
