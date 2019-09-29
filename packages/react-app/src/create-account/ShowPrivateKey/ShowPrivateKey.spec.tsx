import { render } from '@testing-library/react';
import * as React from 'react';
import ShowPrivateKey from './ShowPrivateKey';

describe('ShowPrivateDialog', () => {
  it('renders without crash', () => {
    const component = render(<ShowPrivateKey privateKey={'PK1'} t={() => ('')}/>);
    expect(component).toBeDefined();
    expect(component.findByText('PK1')).toBeDefined();
  });
});
