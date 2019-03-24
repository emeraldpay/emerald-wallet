import * as React from 'react';
import { shallow, mount } from 'enzyme';
import FromField from '.';

describe('FromField', () => {
  it('it renders without crash', () => {
    const wrapper = shallow(<FromField />);
    expect(wrapper).toBeDefined();

    const mounted = mount(<FromField />);
    expect(mounted).toBeDefined();
  });
});
