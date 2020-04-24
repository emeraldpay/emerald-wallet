import { render } from '@testing-library/react';
import * as React from 'react';
import CreateWallet from './CreateWallet';

describe('CreateWallet', () => {
  it('renders without crash', () => {
    const component = render(<CreateWallet />);
    expect(component).toBeDefined();
  });
});
