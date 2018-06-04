import React from 'react';
import { shallow } from 'enzyme';
import { AccountEdit } from './accountEdit';

describe('AccountEdit', () => {
  it('renders without crash', () => {
    const component = shallow(<AccountEdit muiTheme={{palette: {}}}/>);
  });
});
