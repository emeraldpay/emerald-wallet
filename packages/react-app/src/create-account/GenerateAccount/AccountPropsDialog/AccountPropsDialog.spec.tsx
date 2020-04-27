import { render } from '@testing-library/react';
import * as React from 'react';
import AccountPropsDialog from './AccountPropsDialog';

describe('AccountPropsDialog', () => {
  it('renders without crash', () => {
    const component = render(<AccountPropsDialog />);
    expect(component).toBeDefined();
  });
});
