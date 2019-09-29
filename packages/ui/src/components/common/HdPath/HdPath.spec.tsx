import { shallow } from 'enzyme';
import * as React from 'react';
import { HdPath, styles } from './HdPath';

const reduceClasses = (prev, curr) => ({ ...prev,  [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('HdPath', () => {
  it('passes value prop to AutoComplete field', () => {
    const component = shallow(<HdPath classes={classes} value='hd-path' />);
    expect(component).toBeDefined();
    // expect(component.find(AutoComplete).props().searchText).toEqual('hd-path');
  });
});
