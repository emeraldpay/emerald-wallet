import { render } from '@testing-library/react';
import * as React from 'react';
import InitialSetup from './InitialSetup';

describe('InitialSetup', () => {
  it('renders without crashing', () => {
    const component = render(<InitialSetup />);
    expect(component).toBeDefined();
  });
});
