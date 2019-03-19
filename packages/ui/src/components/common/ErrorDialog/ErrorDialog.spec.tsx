import * as React from 'react';
import { shallow } from 'enzyme';
import ErrorDialog from './ErrorDialog';

describe('ErrorDialog', () => {
  it('should be created without crash', () => {
    const component = shallow(<ErrorDialog/>);
    expect(component).toBeDefined();
  });
});


