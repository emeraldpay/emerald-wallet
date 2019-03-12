import * as React from 'react';
import { shallow } from 'enzyme';
import ReceiveDialog from '.';

describe('ReceiveDialog', () => {
  it('should renders without crash', () => {
    const wrapper = shallow(<ReceiveDialog address="0x123" />);
    expect(wrapper).toBeDefined();
  });
});
