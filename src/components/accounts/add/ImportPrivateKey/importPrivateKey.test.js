import React from 'react';
import { shallow } from 'enzyme';
import { ImportPrivateKey } from './importPrivateKey';

const mockMuiTheme = {
  palette: {},
};

describe('ImportPrivateKey', () => {
  it('renders without crash', () => {
    const component = shallow(<ImportPrivateKey muiTheme={mockMuiTheme}/>);
  });
});
