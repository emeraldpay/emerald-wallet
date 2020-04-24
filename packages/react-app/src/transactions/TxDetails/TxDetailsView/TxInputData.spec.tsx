import { shallow } from 'enzyme';
import * as React from 'react';
import TxInputData from './TxInputData';

describe('TxInputData', () => {
  it('should render textarea if length more than 20 chars', () => {
    const wrapper = shallow(<TxInputData data='0x123456789012345678901234567890'/>);
    expect(wrapper.find('textarea')).toHaveLength(1);
  });

  it('should not render textarea if length <= 20 chars', () => {
    const wrapper = shallow(<TxInputData data='0x12'/>);
    expect(wrapper.find('textarea')).toHaveLength(0);
  });
});
