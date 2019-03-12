import * as React from 'react';
import { shallow } from 'enzyme';
import AccountActionsMenu from '.';

describe('AccountActionsMenu', () => {
  it('should renders without crash', () => {
    const wrapper = shallow(<AccountActionsMenu
      hiddenAccount={false}
      canHide={true}
      showPrint={true}
      showExport={true}
      chain="etc"
    />);
    expect(wrapper).toBeDefined();
  });
});
