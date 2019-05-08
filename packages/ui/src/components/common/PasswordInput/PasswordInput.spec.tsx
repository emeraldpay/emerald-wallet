import * as React from 'react';
import { shallow } from 'enzyme';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  it('doesnt show password by default', () => {
    const component = shallow<PasswordInput>(<PasswordInput/>);
    expect(component.state().showPassword).toBeFalsy();
  });
});
