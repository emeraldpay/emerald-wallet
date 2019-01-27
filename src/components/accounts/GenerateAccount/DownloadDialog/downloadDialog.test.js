import React from 'react';
import { shallow } from 'enzyme';
import { DownloadDialog, styles2 } from './downloadDialog';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

describe('DownloadDialog', () => {
  it('renders without crash', () => {
    const component = shallow(<DownloadDialog classes={classes} t={ () => ('') }/>);
  });
});
