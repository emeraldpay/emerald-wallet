import { shallow } from 'enzyme';
import * as React from 'react';
import { ExportPaperWallet, styles } from './ExportPaperWallet';

const reduceClasses = (prev, curr) => ({ ...prev,  [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('ExportPaperWallet', () => {
  it('renders without crash', () => {
    const component = shallow(<ExportPaperWallet accountId='0x1234' classes={classes} />);
    expect(component).toBeDefined();
  });
});
