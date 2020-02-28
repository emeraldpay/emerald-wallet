import { shallow } from 'enzyme';
import * as React from 'react';
import ErrorDialog from './ErrorDialog';

describe('ErrorDialog', () => {
  it('should be created without crash', () => {
    const component = shallow(<ErrorDialog/>);
    expect(component).toBeDefined();
  });
});
