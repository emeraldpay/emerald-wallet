import React from 'react';
import { AutoComplete } from 'material-ui';
import { shallow } from 'enzyme';
import HdPath from './hdPath';

describe('HdPath', () => {
  it('passes value prop to AutoComplete field', () => {
    const component = shallow(<HdPath value="hd-path" />);
    expect(component.find(AutoComplete).props().searchText).toEqual('hd-path');
  });
});
