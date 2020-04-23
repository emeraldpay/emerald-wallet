import { render } from '@testing-library/react';
import * as React from 'react';
import ConfirmMnemonic from './ConfirmMnemonic';

describe('ConfirmMnemonic', () => {
  it('renders without crash', () => {
    const component = render(<ConfirmMnemonic mnemonic='mnemonic phrase' dpath={"m/44'/60'"} />);
    expect(component).toBeDefined();
  });
});
