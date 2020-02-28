import { shallow } from 'enzyme';
import * as React from 'react';
import ConnectionStatus from './ConnectionStatus';

describe('ConectionStatus', () => {
  it('should be created without crash', () => {
    const component = shallow(<ConnectionStatus status={'CONNECTED'}/>);
    expect(component).toBeDefined();
  });

  it('create for disconnected', () => {
    const component = shallow(<ConnectionStatus status={'DISCONNECTED'}/>);
    expect(component).toBeDefined();
  });
});
