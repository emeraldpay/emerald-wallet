import * as React from 'react';
import { shallow } from 'enzyme';
import { ExportPaperWallet, styles2 } from './ExportPaperWallet';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles2).reduce(reduceClasses, {});

describe('ExportPaperWallet', () => {
  it('renders without crash', () => {
    const component = shallow(<ExportPaperWallet accountId="0x1234" classes={classes} />);
    expect(component).toBeDefined();
  });
});
