import { shallow } from 'enzyme';
import * as React from 'react';
import ImportMnemonic from './ImportMnemonic';

describe('ImportMnemonic', () => {
  it('renders without crash', () => {
    const component = shallow(<ImportMnemonic onSubmit={(mnemonic, password) => {
    }}/>);
    expect(component).toBeDefined();
  });
});
