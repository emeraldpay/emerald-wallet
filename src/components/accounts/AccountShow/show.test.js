import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { AccountShow } from './show';

test('Shows HD path for hardware account', () => {
    const account = fromJS({
        id: '0x1234',
        hardware: true,
        hdpath: 'HD/PATH',
    });
    const wrapper = shallow(<AccountShow account={ account }/>);
    expect(wrapper.containsAnyMatchingElements([<div>HD/PATH</div>])).toBeTruthy();
});
