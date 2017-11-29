import React from 'react';
import { shallow } from 'enzyme';

import TextField from 'elements/Form/TextField';
import { Warning } from '../Warning/warning';
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
});
