import { render } from '@testing-library/react';
import * as React from 'react';
import Pager from './Pager';

describe('Pager', () => {
  it('renders without crashing', () => {
    const component = render(<Pager />);
    expect(component).toBeDefined();
  });
});
