import React from 'react';
import { AutoComplete } from 'material-ui';
import { shallow } from 'enzyme';
import { HdPath, styles } from './hdPath';

const reduceClasses = (prev, curr) => Object.assign({}, prev, { [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('HdPath', () => {
  it('passes value prop to AutoComplete field', () => {
    const component = shallow(<HdPath classes={classes} value="hd-path" />);
    expect(component.find(AutoComplete).props().searchText).toEqual('hd-path');
  });
});
