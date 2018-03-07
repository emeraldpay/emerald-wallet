import React from 'react';
import { shallow } from 'enzyme';
import {HideAccountDialog} from './hideAccountDialog';

describe('HideAccountDialog', () => {
  it('renders without crash', () => {
    const component = shallow(<HideAccountDialog t={ () => ('') }/>);
  });
});
