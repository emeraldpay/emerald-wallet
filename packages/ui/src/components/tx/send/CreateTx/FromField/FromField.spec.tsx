import { mount, shallow } from 'enzyme';
import * as React from 'react';
import FromField from '.';

describe('FromField', () => {
  it('it renders without crash', () => {
    const wrapper = shallow(<FromField />);
    expect(wrapper).toBeDefined();

    const mounted = mount(<FromField />);
    expect(mounted).toBeDefined();
  });
});
