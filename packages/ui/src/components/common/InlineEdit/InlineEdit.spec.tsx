import { shallow } from 'enzyme';
import * as React from 'react';
import InlineEdit from './InlineEdit';

describe('InlineEdit', () => {
  it('should be created without crash', () => {
    const component = shallow(<InlineEdit/>);
    expect(component).toBeDefined();
  });
});
