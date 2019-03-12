import React from 'react';
import { shallow } from 'enzyme';
import ShowPrivateDialog from './showPrivateKeyDialog';

describe('ShowPrivateDialog', () => {
  it('renders without crash', () => {
    const component = shallow(<ShowPrivateDialog t={ () => ('') }/>);
  });
});
