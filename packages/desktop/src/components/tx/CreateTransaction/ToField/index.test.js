import React from 'react';
import { shallow } from 'enzyme';
import ToField from '.';

describe('ToField', () => {
  it('it renders without crash', () => {
    const wrapper = shallow(<ToField onChangeTo={jest.fn()}/>);
    expect(wrapper).toBeDefined();
  });

  it('on init calls onChangeTo function', () => {
    const onChangeStub = jest.fn();
    const wrapper = shallow(<ToField onChangeTo={onChangeStub}/>);
    expect(onChangeStub).toHaveBeenCalled();
  });
});
