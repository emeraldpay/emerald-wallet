import { render } from '@testing-library/react';
import * as React from 'react';
import DownloadDialog from './DownloadDialog';

describe('DownloadDialog', () => {
  it('renders without crash', () => {
    const component = render(<DownloadDialog t={() => ('')}/>);
    expect(component).toBeDefined();
  });
});
