import * as React from 'react';
import { shallow } from 'enzyme';
import Advice from './Advice';

describe('Advice', () => {
  it('should be created without crash', () => {
    const component = shallow(<Advice/>);
    expect(component).toBeDefined();
  });
});
