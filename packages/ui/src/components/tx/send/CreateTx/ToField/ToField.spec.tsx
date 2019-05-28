import * as React from 'react';
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
  it('handle input change', () => {
    const onChangeStub = jest.fn();
    const component = shallow(<ToField onChangeTo={onChangeStub}/>);
    component.find('Input').simulate('change', {target: {value:'0x5671'}});
    expect(onChangeStub.mock.calls.length).toBe(2);
    expect(onChangeStub.mock.calls[1][0]).toBe('0x5671');
  })
});
