import React from 'react';
import { shallow } from 'enzyme';
import ReceiveDialog from '.';

describe('ReceiveDialog', () => {
  it('should renders without crash', () => {
    const wrapper = shallow(<ReceiveDialog />);
    expect(wrapper).toBeDefined();
  });
});
