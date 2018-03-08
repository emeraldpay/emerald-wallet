import React from 'react';
import { shallow } from 'enzyme';
import { DownloadDialog } from './downloadDialog';

describe('DownloadDialog', () => {
  it('renders without crash', () => {
    const component = shallow(<DownloadDialog t={ () => ('') }/>);
  });
});
