import { render } from '@testing-library/react';
import * as React from 'react';
import Terms from './Terms';

describe('Terms', () => {
  it('renders without crashing', () => {
    const component = render(<Terms />);
    expect(component).toBeDefined();
  });
});
