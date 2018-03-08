import React from 'react';
import { shallow } from 'enzyme';
import { ImportMnemonic } from './importMnemonic';

describe('ImportMnemonic', () => {
  it('renders without crash', () => {
    const component = shallow(<ImportMnemonic />);
  });
});
