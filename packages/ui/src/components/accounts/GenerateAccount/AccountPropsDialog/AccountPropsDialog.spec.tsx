import * as React from 'react';
import { shallow } from 'enzyme';
import AccountPropsDialog from './AccountPropsDialog';

describe('AccountPropsDialog', () => {
  it('renders without crash', () => {
    const component = shallow(<AccountPropsDialog />);
    expect(component).toBeDefined();
  });
});
