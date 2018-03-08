import React from 'react';
import { shallow } from 'enzyme';
import { Warning } from 'emerald-js-ui';
import TextField from '../Form/TextField';
import PasswordInput from './passwordInput';


describe('PasswordInput', () => {
  it('renders Warning if props.error set', () => {
    const component = shallow(<PasswordInput error="Some Error"/>);
    expect(component.find(Warning)).toHaveLength(1);
  });

  it('pass error prop to TextField', () => {
    const component = shallow(<PasswordInput error="Some Error"/>);
    expect(component.find(TextField).props().error).toEqual('Some Error');
  });

  it('does not render Warning if props.error underfined', () => {
    const component = shallow(<PasswordInput/>);
    expect(component.find(Warning)).toHaveLength(0);
  });
  it('doesnt show password by default', () => {
    const component = shallow(<PasswordInput/>);
    expect(component.state().showPassword).toBeFalsy();
  });
});
