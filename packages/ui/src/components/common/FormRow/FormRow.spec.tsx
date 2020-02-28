import { shallow } from 'enzyme';
import * as React from 'react';
import FormRow from './FormRow';

describe('FormRow', () => {
  it('renders without crash', () => {
    const component = shallow(<FormRow />);
    expect(component).toBeDefined();
  });
});
