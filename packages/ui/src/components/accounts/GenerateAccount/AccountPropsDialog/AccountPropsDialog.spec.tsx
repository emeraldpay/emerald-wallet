import { shallow } from 'enzyme';
import * as React from 'react';
import AccountPropsDialog from './AccountPropsDialog';

describe('AccountPropsDialog', () => {
  it('renders without crash', () => {
    const component = shallow(<AccountPropsDialog />);
    expect(component).toBeDefined();
  });
});
