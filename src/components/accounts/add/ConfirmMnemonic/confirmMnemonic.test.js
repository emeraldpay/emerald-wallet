import React from 'react';
import { shallow } from 'enzyme';
import { ConfirmMnemonic } from './confirmMnemonic';

describe('ConfirmMnemonic', () => {
  it('renders without crash', () => {
    const component = shallow(<ConfirmMnemonic />);
  });
});
