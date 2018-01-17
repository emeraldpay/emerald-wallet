import React from 'react';
import { shallow } from 'enzyme';
import { NewMnemonic } from './newMnemonic';
import { Button } from 'emerald-js-ui';

describe('When mnemonic is empty NewMnemonic', () => {
  it('renders Generate button', () => {
    const component = shallow(<NewMnemonic />);
    expect(component.find(Button).props().label).toEqual('Generate');
  });
});

describe('When mnemonic not empty NewMnemonic', () => {
  it('renders Continue button', () => {
    const component = shallow(<NewMnemonic mnemonic="some mnemonic"/>);
    expect(component.find(Button).props().label).toEqual('Continue');
  });
});
