import { render } from '@testing-library/react';
import * as React from 'react';
import LoadingIcon from './LoadingIcon';

describe('LoadingIcon', () => {
  it('should render without crash', () => {
    const comp = render(<LoadingIcon />);
    expect(comp).toBeDefined();
  });
});
