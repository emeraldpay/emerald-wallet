import * as React from 'react';
import { shallow } from 'enzyme';
import { Warning, Input } from '@emeraldplatform/ui';
import { PasswordInput } from './PasswordInput';


describe('PasswordInput', () => {
  it('renders Warning if props.error set', () => {
    const component = shallow(<PasswordInput error="Some Error"/>);
    expect(component.find(Warning)).toHaveLength(1);
  });

  it('does not render Warning if props.error underfined', () => {
    const component = shallow(<PasswordInput/>);
    expect(component.find(Warning)).toHaveLength(0);
  });
  it('doesnt show password by default', () => {
    const component = shallow<PasswordInput>(<PasswordInput/>);
    expect(component.state().showPassword).toBeFalsy();
  });
});
