import { shallow } from 'enzyme';
import * as React from 'react';
import ImportMnemonic from './ImportMnemonic';

describe('ImportMnemonic', () => {
  it('renders without crash', () => {
    const component = shallow(<ImportMnemonic onSubmit={() => void 0} isValidMnemonic={() => true} />);
    expect(component).toBeDefined();
  });
});
