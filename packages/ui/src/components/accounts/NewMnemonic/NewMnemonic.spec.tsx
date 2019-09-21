import { shallow } from 'enzyme';
import * as React from 'react';
import Button from '../../common/Button';
import { NewMnemonic, styles } from './NewMnemonic';

const reduceClasses = (prev, curr) => ({ ...prev,  [curr]: curr });
const classes = Object.keys(styles).reduce(reduceClasses, {});

describe('When mnemonic is empty NewMnemonic', () => {
  it('renders Generate button', () => {
    const component = shallow(<NewMnemonic classes={classes}/>);
    expect(component.find(Button).props().label).toEqual('Generate');
  });
});

describe('When mnemonic not empty NewMnemonic', () => {
  it('renders Continue button', () => {
    const component = shallow(<NewMnemonic classes={classes} mnemonic='some mnemonic'/>);
    expect(component.find(Button).props().label).toEqual('Continue');
  });
});
