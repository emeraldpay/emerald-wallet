import React from 'react';
import { shallow } from 'enzyme';
import PasswordDialog from './passwordDialog';

describe('PasswordDialog', () => {
  it('renders without crash', () => {
    const component = shallow(<PasswordDialog t={ () => ('') }/>);
  });
});
