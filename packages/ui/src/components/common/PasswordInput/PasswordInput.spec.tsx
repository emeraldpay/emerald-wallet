import { shallow } from 'enzyme';
import * as React from 'react';
import PasswordInput from './PasswordInput';

describe('PasswordInput', () => {
  it('doesnt show password by default', () => {
    const component = shallow(<PasswordInput/>);
  });
});
