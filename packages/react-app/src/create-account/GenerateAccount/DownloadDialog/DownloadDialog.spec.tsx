import { render } from '@testing-library/react';
import * as React from 'react';
import DownloadDialog from './DownloadDialog';

describe('DownloadDialog', () => {
  it('renders without crash', () => {
    const component = render(<DownloadDialog t={jest.fn()} onBack={jest.fn()} onDownload={jest.fn()}/>);
    expect(component).toBeDefined();
  });
});
